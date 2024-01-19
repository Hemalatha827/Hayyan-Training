const express = require('express');
const router = express.Router();
const utilityController = require('../controllers/utilityController');

router.post('/creditCardNumber', utilityController.creditCardNumberValidation);
router.post('/creditCardMonthValidation', utilityController.creditCardMonthValidation);
router.post('/creditCardYearValidation', utilityController.creditCardYearValidation);
router.post('/creditCardCvvValidation', utilityController.creditCardCvvValidation);
router.post('/getAvaialbleDeliveryTime', utilityController.getDeliveryTime);
router.post('/isNum', utilityController.checkIsNum);

module.exports = router;