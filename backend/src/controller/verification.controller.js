const { v4: uuidv4 } = require('uuid');
const axios    = require('axios');
const imagekit = require('../config/imagekit');
const userModel = require('../models/user.model');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://karshs-coveer-verification.hf.space';

// POST /verify/upload
async function uploadDocuments(req, res) {
  try {
    const userId = req.user._id;
    const identityFile = req.files?.identityProof?.[0];
    const platformFile = req.files?.platformProof?.[0];

    if (!identityFile || !platformFile) {
      return res.status(400).json({ message: 'Both identity proof and platform proof are required' });
    }

    const upload = (file, fieldName) => new Promise((resolve, reject) => {
      imagekit.upload({
        file:     file.buffer.toString('base64'),
        fileName: `${fieldName}_${uuidv4()}`,
        folder:   `coveer/verification/${userId}`,
      }, (err, result) => {
        if (err) reject(err);
        else resolve(result.url);
      });
    });

    const [identityUrl, platformUrl] = await Promise.all([
      upload(identityFile, 'identityProof'),
      upload(platformFile, 'platformProof'),
    ]);

    // Save URLs and set to under_review immediately
    const user = await userModel.findById(userId).select('fullName dob platform');
    await userModel.findByIdAndUpdate(userId, {
      'verificationDocuments.identityProof': identityUrl,
      'verificationDocuments.platformProof': platformUrl,
      verificationStatus:      'under_review',
      verificationSubmittedAt: new Date(),
    });

    // Call ML service asynchronously — don't block the response
    setImmediate(async () => {
      try {
        const mlRes = await axios.post(`${ML_SERVICE_URL}/validate`, {
          userId: String(userId),
          identityProofUrl: identityUrl,
          platformProofUrl: platformUrl,
          userProfile: {
            firstName: user.fullName?.firstName || '',
            lastName:  user.fullName?.lastName  || '',
            dob:       user.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
            platform:  user.platform || '',
          },
        }, { timeout: 60000 });

        const { valid, reason, confidence } = mlRes.data;

        if (valid) {
          await userModel.findByIdAndUpdate(userId, {
            verificationStatus:      'verified',
            isVerified:              true,
            verificationCompletedAt: new Date(),
          });
          console.log(`[Verify] User ${userId} auto-verified (confidence: ${confidence})`);
        } else if (reason === 'manual_review') {
          // Keep under_review — admin will decide
          console.log(`[Verify] User ${userId} flagged for manual review (confidence: ${confidence})`);
        } else {
          await userModel.findByIdAndUpdate(userId, {
            verificationStatus:          'rejected',
            verificationRejectionReason: reason || 'Verification failed',
            verificationCompletedAt:     new Date(),
          });
          console.log(`[Verify] User ${userId} rejected — ${reason} (confidence: ${confidence})`);
        }
      } catch (mlErr) {
        console.error('[Verify] ML service error:', mlErr.message);
        // Leave as under_review for manual admin review
      }
    });

    return res.status(200).json({ message: 'Documents submitted successfully', status: 'under_review' });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Failed to upload documents. Please try again.' });
  }
}

// GET /verify/status
async function getVerificationStatus(req, res) {
  try {
    const user = await userModel.findById(req.user._id).select('verificationStatus verificationSubmittedAt verificationRejectionReason');
    return res.status(200).json({
      status:      user.verificationStatus,
      submittedAt: user.verificationSubmittedAt,
      rejectionReason: user.verificationRejectionReason,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// PATCH /verify/admin/update-status
async function updateVerificationStatus(req, res) {
  try {
    const { userId, status, rejectionReason } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ message: 'userId and status are required' });
    }

    const update = { verificationStatus: status };
    if (status === 'verified' || status === 'rejected') {
      update.verificationCompletedAt = new Date();
    }
    if (status === 'verified') {
      update.isVerified = true;
    }
    if (status === 'rejected' && rejectionReason) {
      update.verificationRejectionReason = rejectionReason;
    }

    await userModel.findByIdAndUpdate(userId, update);
    return res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { uploadDocuments, getVerificationStatus, updateVerificationStatus };
