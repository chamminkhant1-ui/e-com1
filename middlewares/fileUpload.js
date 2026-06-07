const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Use the original file extension
    cb(
      null,
      file.originalname.split('.')[0] +
        '-' +
        uniqueSuffix +
        '.' +
        file.originalname.split('.')[1],
    );
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const upload = multer({ storage: storage });

module.exports = upload;
