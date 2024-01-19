const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');


router.post('/product', searchController.productSeacrh);
router.post('/b2bProduct', searchController.b2bProductSeacrh);
router.post('/size', searchController.sizeSearch);

module.exports = router;