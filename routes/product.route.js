const router = require('express').Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/product.controller');
const { verifyJwt, allowTo } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/fileUpload');
// const Product = require('../models/product.model');

router.post(
  '/',
  // verifyJwt,
  // allowTo('admin'),
  upload.single('image'),
  createProduct,
);
router.get('/', verifyJwt, getAllProducts);
router.get('/:id', verifyJwt, getProductById);

module.exports = router;
