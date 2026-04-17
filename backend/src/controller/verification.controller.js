const { v4: uuidv4 } = require('uuid');
const axios    = require('axios');
const imagekit = require('../config/imagekit');
const userModel = require('../models/user.model');
const { notify } = require('../services/notification.service');

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
        console.log(`[Verify] Calling ML service for user ${userId}`);
        console.log(`[Verify] Identity URL: ${identityUrl}`);
        console.log(`[Verify] Platform URL: ${platformUrl}`);

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
        }, { timeout: 90000 });

        const { valid, reason, confidence } = mlRes.data;
        console.log(`[Verify] ML response for user ${userId}: valid=${valid}, reason=${reason}, confidence=${confidence}`);

        if (valid) {
          await userModel.findByIdAndUpdate(userId, {
            verificationStatus:      'verified',
            isVerified:              true,
            verificationCompletedAt: new Date(),
          });
          console.log(`[Verify] User ${userId} auto-verified`);
          await notify(userId, 'info', '✅ Identity Verified',
            'Your documents have been verified successfully. Your coverage is now fully active and payouts are enabled.');
        } else if (reason === 'manual_review') {
          console.log(`[Verify] User ${userId} flagged for manual review (confidence: ${confidence})`);
          await notify(userId, 'info', '🔍 Verification Under Review',
            "Our team is reviewing your documents. This usually takes a few hours. You'll be notified once complete.");
        } else {
          await userModel.findByIdAndUpdate(userId, {
            verificationStatus:          'rejected',
            verificationRejectionReason: reason || 'Verification failed',
            verificationCompletedAt:     new Date(),
          });
          console.log(`[Verify] User ${userId} rejected — ${reason}`);
          await notify(userId, 'info', '❌ Verification Failed',
            `We couldn't verify your documents. Reason: ${reason || 'Document validation failed'}. Please re-upload clear photos and try again.`);
        }
      } catch (mlErr) {
        console.error(`[Verify] ML service call FAILED for user ${userId}:`, mlErr.message);
        console.error(`[Verify] Status: ${mlErr.response?.status}, Data: ${JSON.stringify(mlErr.response?.data)}`);
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
