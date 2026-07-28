const multer = require('multer');
const path = require('path');
const { generateId } = require('../utils/helpers');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '..', 'uploads');
    if (file.fieldname === 'receipt') {
      uploadPath = path.join(uploadPath, 'receipts');
    } else if (file.fieldname === 'avatar' || file.fieldname === 'profile') {
      uploadPath = path.join(uploadPath, 'profiles');
    } else if (file.fieldname === 'category') {
      uploadPath = path.join(uploadPath, 'categories');
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${generateId()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadReceipt = upload.single('receipt');
const uploadProfile = upload.single('avatar');
const uploadCategory = upload.single('category');

module.exports = { upload, uploadReceipt, uploadProfile, uploadCategory };
