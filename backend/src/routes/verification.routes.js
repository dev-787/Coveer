const express = require('express');
const multer  = require('multer');
const { authUser } = require('../middlewares/auth.middleware');
const {
  uploadDocuments,
  getVerificationStatus,
  updateVerificationStatus,
} = require('../controller/verification.controller');

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are accepted'));
    }
  },
});

const docUpload = upload.fields([
  { name: 'identityProof', maxCount: 1 },
  { name: 'platformProof', maxCount: 1 },
]);

router.post('/upload',              authUser, docUpload, uploadDocuments);
router.get('/status',               authUser, getVerificationStatus);
router.patch('/admin/update-status', authUser, updateVerificationStatus);

module.exports = router;
