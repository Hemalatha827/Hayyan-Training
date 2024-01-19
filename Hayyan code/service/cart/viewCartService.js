const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

exports.dynamicCartViewMessage = function (data, start, dataTotalCount) {
    var messages = [];
    var end = (dataTotalCount - start > 10) ? start + 10 : start + (dataTotalCount - start);


    //Information count
    if (dataTotalCount > 0) {
        messages.push({
            "message": {
                "text": "Cart items " + (start + 1) + "-" + end + " of " + dataTotalCount
            }
        });

        //Create properties card
        messages.push({
            "message": {
                "attachment": {
                    "payload": {
                        "elements": createCartViewGallery(data),
                        "template_type": "generic"
                    },
                    "type": "template"
                }
            }
        });
    } else {
        return messages;
    }

    //Send followup message
    messages.push({
        "message": {
            "text": "Tap to continue👇",
            "quick_replies": createCartQuickReplies(dataTotalCount)
        }
    });

    return messages;
}


function createCartQuickReplies(dataTotalCount) {
    var quickReplies = [];

    if (dataTotalCount > 0) {

        quickReplies.push(
            utils.createButtonOrQuickReply(
                "qr",
                GLOBAL.FLOW.CHECKOUT.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.CHECKOUT.FLOW_ID]
            )
        );

        quickReplies.push(
            utils.createButtonOrQuickReply(
                "qr",
                GLOBAL.FLOW.DELETE_ALL_CART.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.DELETE_ALL_CART.FLOW_ID]
            )
        );

        quickReplies.push(
            utils.createButtonOrQuickReply(
                "qr",
                GLOBAL.FLOW.QUICK_SEARCH.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.QUICK_SEARCH.FLOW_ID]
            )
        );

    }

    return quickReplies;
}


function createCartViewGallery(cartData) {
    const cards = [];
    const cartItems = cartData.cart;
    const cartItemDetails = cartData["cart-details"];

    cartItems.forEach((item) => {
        var buttons = [];

        buttons.push(
            utils.createButtonOrQuickReply(
                "button",
                GLOBAL.FLOW.UPDATE_ITEM_IN_CART.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", cartItemDetails[item]["picture"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", cartItemDetails[item]["name"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2c_price", cartItemDetails[item]["price"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.UPDATE_ITEM_IN_CART.FLOW_ID],
            )
        );

        buttons.push(
            utils.createButtonOrQuickReply(
                "button",
                GLOBAL.FLOW.REMOVE_FROM_CART.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", cartItemDetails[item]["name"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.REMOVE_FROM_CART.FLOW_ID],
            )
        );

        const b2cPrice = cartItemDetails[item]["price"];

        const productCount = cartItemDetails[item]["count"];

        let price_local = b2cPrice.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });
        let itemTotal_local = (b2cPrice * productCount).toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });


        const subTitle = "Item total : " + GLOBAL.SEARCH.CURRENCY_SYMBOL + price_local + " x" + cartItemDetails[item]["count"] + " = " + GLOBAL.SEARCH.CURRENCY_SYMBOL + itemTotal_local;

        const card = {
            "title": cartItemDetails[item]["name"] + " | 🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + price_local,
            "subtitle": subTitle,
            "image_url": cartItemDetails[item]["picture"],
            "buttons": buttons
        };

        cards.push(card);
    });

    return cards;

}