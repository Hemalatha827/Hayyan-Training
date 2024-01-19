const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

exports.dynamicSizeSearchMessage = function (data, cartData, start, dataTotalCount) {
    var messages = [];

    //Information count
    if (dataTotalCount > 0) {

        //Create properties card
        messages.push({
            "message": {
                "attachment": {
                    "payload": {
                        "elements": createSizeSearchGallery(data, cartData, start, dataTotalCount),
                        "template_type": "generic"
                    },
                    "type": "template"
                }
            }
        });
    }

    //Information count
    // if (dataTotalCount > 0) {

    //     //Create sizr QR
    //     messages.push({
    //         "message": {
    //             "text": "🔢Choose the desired quantity or size from the options below:",
    //             "quick_replies": createSizeQrs(data)
    //         }
    //     });
    // }

    return messages;
}

function createSizeQrs(data) {
    var qrs = [];
    data.forEach((item) => {
        const btnText = '(' + GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) + ")" + item._source["size"];
        qrs.push(
            utils.createButtonOrQuickReply(
                "qr",
                btnText,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "main_product_id", item._source["product_id"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["product_id"] + "." + item._source["id"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", item._source["cover_image"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", item._source["size"] + " " + item._source["product_name"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_price", item._source["price"]],
                // [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product-available-date", utils.getCurrentDateTimeInISO()],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.ADD_TO_CART.FLOW_ID],
            )
        );
    });

    return qrs;
}


function createSizeSearchGallery(data, cartData, start, dataTotalCount) {
    var cards = [];
    const cart = cartData["cart"];

    data.forEach((item) => {
        var buttons = [];
        const sizeItemId = item._source["product_id"] + "." + item._source["id"];
        if (cart.includes(sizeItemId)) {
            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.UPDATE_ITEM_IN_CART.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["product_id"] + "." + item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "main_product_id", item._source["product_id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", item._source["cover_image"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_name", item._source["size"] + " " + item._source["product_name"]],
                    // [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart-operation", 'update-menu-item'],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2b_price", item._source["b2b_price"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2c_price", item._source["b2c_price"]],
                    //[GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "has_size", true],
                    // [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "has-toppings", item._source["toppings-availability"]],
                    //[GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product-available-time", currentTime],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.UPDATE_ITEM_IN_CART.FLOW_ID],
                )
            );

            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.REMOVE_FROM_CART.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", sizeItemId],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.REMOVE_FROM_CART.FLOW_ID],
                )
            );

        } else {

            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.ADD_TO_CART.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "main_product_id", item._source["product_id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", sizeItemId],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", item._source["cover_image"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", item._source["size"] + " " + item._source["product_name"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2b_price", item._source["b2b_price"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2c_price", item._source["b2c_price"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.ADD_TO_CART.FLOW_ID],
                )
            );
        }

        let subTitle = "";
        const b2b_price = item._source["b2b_price"];
        const b2c_price = item._source["b2c_price"];

        if (b2b_price && b2c_price) {
            subTitle = "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + b2b_price.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) + "(Wholesale) | ";
            subTitle += "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + b2c_price.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) + "(Retail)";
            // title = title + (!hasSize ? " | 🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) : "");
        } else if (b2b_price) {
            subTitle = "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + b2b_price.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });
        } else if (b2c_price) {
            subTitle = "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + b2c_price.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });
        }

        var card = {
            "title": item._source["size"] + " " + item._source["product_name"],
            "subtitle": subTitle,
            "image_url": item._source["cover_image"],
            "buttons": buttons
        };

        cards.push(card);
    });

    //Last card as pagination
    if (dataTotalCount > (start + GLOBAL.SEARCH.MAX_PAGE_SIZE)) {

        var card = {
            "title": "Tap👇",
            "image_url": GLOBAL.FLOW.NEXT_PAGE_PRODUCT_SEARCH_CARDS.IMAGE,
            "buttons": [
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.NEXT_PAGE_PRODUCT_SEARCH_CARDS.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "card_search_index", start + GLOBAL.SEARCH.MAX_PAGE_SIZE],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.NEXT_PAGE_PRODUCT_SEARCH_CARDS.FLOW_ID],

                )]
        };

        cards.push(card);
    }

    return cards;

}
