const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');


router.post('/view', cartController.viewCart);
router.post('/addOrUpdate', cartController.addOrModifyCart);
router.post('/removeItem', cartController.removeFromCart);

module.exports = router;