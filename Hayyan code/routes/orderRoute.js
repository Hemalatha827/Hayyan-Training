const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.post('/prepare', orderController.prepareOrder);
router.post('/payment-link', orderController.createPaymentLink);
router.post('/payment-webhook', orderController.paymentWebhook);
router.post('/process-order', orderController.processOrderAndTriggerEmail);


module.exports = router;