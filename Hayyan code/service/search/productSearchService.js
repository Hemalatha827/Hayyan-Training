const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

exports.dynamicSearchMessage = function (data, cartData, start, dataTotalCount, options, currentTime, validity) {
    var messages = [];
    var end = (dataTotalCount - start > GLOBAL.SEARCH.MAX_PAGE_SIZE) ? start + GLOBAL.SEARCH.MAX_PAGE_SIZE : start + (dataTotalCount - start);

    //Information count
    if (dataTotalCount > 0) {
        messages.push({
            "message": {
                "text": (start + 1) + "-" + end + " of " + dataTotalCount + " Products👇"
            }
        });

        //Create properties card
        messages.push({
            "message": {
                "attachment": {
                    "payload": {
                        "elements": createSearchGallery(data, cartData, start, dataTotalCount, currentTime, validity),
                        "template_type": "generic"
                    },
                    "type": "template"
                }
            }
        });
    } else {
        messages.push({
            "message": {
                "text": "Sorry! Nothing found. Please refine your search."
            }
        });
    }

    //Send followup message
    messages.push({
        "message": {
            "text": "Discover more treasures in our diverse range of products! 🌟🛒🔍",
            "quick_replies": createSearchQuickReplies(cartData, options)
        }
    });

    return messages;
}


function createSearchGallery(data, cartData, start, dataTotalCount, currentTime, validity) {
    const cards = [];
    const cart = cartData["cart"];

    data.forEach((item) => {
        const buttons = [];
        const hasSize = item._source["size_availability"];

        //const productAddedToCartTime = cartDetails ? cartDetails[item._id]?.["product-added-time"] || currentTime : currentTime;
        //const isItemValid = (productAddedToCartTime + validity) > currentTime;

        // if (isItemValid && cart.includes(item._id)) {
        if (cart.includes(item._id)) {
            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.UPDATE_ITEM_IN_CART.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "main_product_id", item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", item._source["cover_image"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", item._source["product_name"]],
                    // [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart-operation", 'update-menu-item'],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2c_price", item._source["price"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "has_size", item._source["size_availability"]],
                    // [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "has-toppings", item._source["toppings-availability"]],
                    //[GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product-available-time", currentTime],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.UPDATE_ITEM_IN_CART.FLOW_ID],
                )
            );

            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    GLOBAL.FLOW.REMOVE_FROM_CART.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.REMOVE_FROM_CART.FLOW_ID],
                )
            );

        } else {


            let btnTxt = GLOBAL.FLOW.ADD_TO_CART.TEXT;
            let flowId = GLOBAL.FLOW.ADD_TO_CART.FLOW_ID;
            if (hasSize) {
                btnTxt = GLOBAL.FLOW.VIEW_OPTIONS.TEXT;
                flowId = GLOBAL.FLOW.SELECT_SIZE.FLOW_ID;
            }

            buttons.push(
                utils.createButtonOrQuickReply(
                    "button",
                    btnTxt,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "main_product_id", item._source["id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_image", item._source["cover_image"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", item._source["product_name"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_b2c_price", item._source["price"]],
                    //[GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart_operation", 'add-item'],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "has_size", item._source["size_availability"]],
                    //[GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_available_time", currentTime],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, flowId],
                )
            );


            if (item._source["info"] && item._source["info"] !== '' && item._source["info"] !== '-') {
                buttons.push({
                    "title": "💡Interesting Facts",
                    "type": "web_url",
                    "url": item._source["info"]
                });
            }
            //}

        }

        let title = item._source["product_name"];

        const b2c_price = item._source["price"];

        let subTitle = "🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + b2c_price.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });
        subTitle = !hasSize ? subTitle : "Starts from " + subTitle;

        var card = {

            "title": title,
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
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1688916910534"],

                )]
        };

        cards.push(card);
    }

    return cards;

}

function createSearchQuickReplies(cartData, options) {
    var quickReplies = [];


    const cart = cartData["cart"];

    if (cart.length > 0) {

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
                GLOBAL.FLOW.VIEW_CART.TEXT + " (" + cart.length + ")",
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.VIEW_CART.FLOW_ID]
            )
        );

        quickReplies.push(
            utils.createButtonOrQuickReply(
                "qr",
                GLOBAL.FLOW.DELETE_CART.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.DELETE_CART.FLOW_ID]
            )
        );



        options.forEach(function (element, index) {
            if (index < 6)
                quickReplies.push(utils.createButtonOrQuickReply(
                    "qr",
                    element,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "card_search_index", 0],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "A1", element],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "Q1", "category"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "T1", "term"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1688916910534"]
                )
                );
        });
    } else {
        options.forEach(function (element, index) {
            if (index < 10)
                quickReplies.push(utils.createButtonOrQuickReply(
                    "qr",
                    element,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "card_search_index", 0],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "A1", element],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "Q1", "category"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "T1", "term"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1688916910534"]
                )
                );
        });
    }

    quickReplies.push(
        utils.createButtonOrQuickReply(
            "qr",
            GLOBAL.FLOW.QUICK_SEARCH.TEXT,
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "qr_search_index", 1],
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1689405636359"]
        )
    );

    return quickReplies;
}
