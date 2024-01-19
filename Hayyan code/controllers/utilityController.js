const GLOBAL = require('../GLOBAL_VARS.json');
const utils = require('../utilities/utilitieFunc');

//validate/creditCardNumber
exports.creditCardNumberValidation = (req, res) => {
    const postData = req.body;
    const cardNumber = postData["credit-card-number"];
    const sanitizedCardNumber = cardNumber.replace(/\s/g, ""); // Remove spaces

    postData.validation = utils.validateCreditCard(sanitizedCardNumber);
    if (postData.validation) {
        postData["credit-card-encrypted"] = utils.encryptCreditCardNumber(sanitizedCardNumber);
    };
    res.json({
        "actions": utils.createCUFActions(
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-validation", postData["validation"]],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-last-4", sanitizedCardNumber.slice(-4)],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "cc-number"],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-number-encrypted", postData["credit-card-encrypted"]],
        )

    });
};

//validate is input number
exports.checkIsNum = (req, res) => {
    const postData = req.body;
    const input = postData["input"];

    if (utils.isNumber(input)) {
        res.json({
            "product_count": parseInt(input)
        });
        return;
    } else {
        res.json({
            "product_count": 0
        });
        return;
    }

};

exports.creditCardMonthValidation = (req, res) => {
    const postData = req.body;
    const inputMonth = postData["credit-card-month"];
    const formattedMonth = utils.formatCreditCardMonth(inputMonth);

    postData["credit-card-month"] = formattedMonth;

    postData.validation = utils.validateCreditCardMonth(formattedMonth);
    res.json({
        "actions": utils.createCUFActions(
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-validation", postData["validation"]],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-month", formattedMonth],
        )
    });
};


exports.creditCardYearValidation = (req, res) => {
    const postData = req.body;
    const inputYear = postData["credit-card-year"];

    postData.validation = utils.validateYear(inputYear);
    res.json({
        "actions": utils.createCUFActions(
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-validation", postData["validation"]],
        )
    });
};

exports.creditCardCvvValidation = (req, res) => {
    const postData = req.body;

    const cvv = postData["credit-card-cvv"];
    const encryptedCard = postData["credit-card-encrypted"];

    postData.validation = utils.validateCVV(cvv);
    if (postData.validation && encryptedCard) {
        postData["credit-card-number"] = utils.decryptCreditCardNumber(encryptedCard);
    };

    res.json({
        "actions": utils.createCUFActions(
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-validation", postData["validation"]],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cc-number", postData["credit-card-number"]],
        )

    });
};


exports.getDeliveryTime = (req, res) => {
    const data = req.body;

    const openingHrs = data["opening-hour"];
    const closingHours = data["closing-hour"];
    const currentTime = data["current-time"];
    const index = data["search-index"];

    const availableHrs = utils.generateTimeSlots(openingHrs, closingHours, currentTime);
    const indexedTimings = utils.getSlicedArrayBasedOnIndex(availableHrs, index);

    const availableTimings = indexedTimings.slice(0, GLOBAL.SEARCH.MAX_PAGE_SIZE - 1);

    if (indexedTimings.length > GLOBAL.SEARCH.MAX_PAGE_SIZE - 1) {
        availableTimings.push(GLOBAL.MESSAGE.NEXT);
    }
    if (index > 0) {
        availableTimings.unshift(GLOBAL.MESSAGE.RETURN);
    }

    res.json({
        "data": availableTimings
    });
};