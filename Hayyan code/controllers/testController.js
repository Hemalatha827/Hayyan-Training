const GLOBAL = require('../GLOBAL_VARS.json');
const utils = require('../utilities/utilitieFunc');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const addOrModifyCartService = require('../service/cart/addOrModifyCartService');
const viewCartService = require('../service/cart/viewCartService');

exports.test = (req, res) => {
    res.send(utils.isProductStillAvailable("2023-08-22T12:28:00", 422));
};