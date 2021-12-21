const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'photos');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_').split(".")[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, req.body && req.body.imageNameInDatabase || name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage}).single('image'); 