const GLOBAL = require('../../GLOBAL_VARS.json');
const zincUtils = require('../../utilities/zincQueryBuilder');


exports.addProduct = function (postData, userCartDetails) {

    let productId = postData["product-id"];
    let userId = String(postData["search-data"][0]["value"]);

    userCartDetails["id"] = userId;
    userCartDetails["cart-details"][productId] = postData["product-details"];
    //postData["product-details"]["count"] = 1;
    userCartDetails["cart"] = Object.keys(userCartDetails["cart-details"]);

    //update details
    return zincUtils.insertIntoZs(userCartDetails, GLOBAL.SERVER.ZS_CART_INDEX, userId);

}


exports.afterAddToCartMessage = function (postData, userOrderDetails) {

    const productName = postData["product-details"]["name"];
    const productCount = postData["product-details"]["count"];
    const botMessageText = `${productName}(${productCount}) added to your shopping Cart`;

    let messages = [];

    //Create messge with button
    messages.push({
        "message": {
            "attachment": {
                "payload": {
                    "buttons": [{
                        "title": GLOBAL.FLOW.VIEW_CART.TEXT + " (" + userOrderDetails["cart"].length + ")",
                        "type": "web_url",
                        "url": "https://google.com"
                    }
                        /*,{
                          "title": "Checkout",
                          "payload": "FLOW_OR_STEP_ID",
                          "type": "postback"
                        }
                        ,{
                          "title": "Continue shopping",
                          "type": "phone_number",
                          "payload": "<your_phone_number_with_county_code>"
                        }*/
                    ],
                    "template_type": "button",
                    "text": botMessageText
                },
                "type": "template"
            }
        }
    });


    return messages;
}