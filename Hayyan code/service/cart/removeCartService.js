const GLOBAL = require('../../GLOBAL_VARS.json');
const zincUtils = require('../../utilities/zincQueryBuilder');

exports.removeItemFromCart = function (postData, userOrderDetails) {
    let productId = postData["product-id"];
    const userId = String(postData["search-data"][0]["value"]);

    if (productId in userOrderDetails["cart-details"]) {

        delete userOrderDetails["cart-details"][productId];
        userOrderDetails["cart"] = Object.keys(userOrderDetails["cart-details"]);

        //update details
        zincUtils.insertIntoZs(userOrderDetails, GLOBAL.SERVER.ZS_CART_INDEX, userId);

    }

}