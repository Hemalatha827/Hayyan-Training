const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');
const paymentService = require('../../connections/paymentConnector');

exports.createCheckoutData = async function (cartData, postData) {

    let messages = {
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button"
                }
            },
            "quick_replies": []
        }
    };

    let actions = [];


    if (cartData.cart.length == 0) {
        messages.message["text"] = "Your cart is empty!"

        let quickReplies = [];

        quickReplies.push(
            utils.createButtonOrQuickReply(
                "button",
                GLOBAL.FLOW.CONTINUE_SHOPPING.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.CONTINUE_SHOPPING.FLOW_ID],
            )
        );

        messages.message["quick_replies"] = quickReplies;

    } else {
        let messageText =
            "🤵" + postData["customer-name"] + "\n" +
            "📩" + postData["customer-email"] + "\n" +
            "📞" + postData["customer-phoneno"] + "\n\n";

        messageText += "📬" + postData["customer-address"] + "\n" +
            postData["customer-postcode"] + "\n\n"

        const response = calculateOderValue(cartData, postData);

        messageText += "-----------------------------\n" +
            "\t📦Order Details\n\n";

        const orderId = utils.generateUniqueSixDigitID();
        postData["order-id"] = orderId;

        messageText +=
            //"\n-----------------------------\n" +
            "Order No - #" + orderId +
            "\nCart value - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + response.cartValue.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            //"\nConvenience Fee(" + conveniencePercent + "%) - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + convenienceFee.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            "\nDelivery Fee - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + response.deliveryFee.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            // "\n-----------------------------\n" +
            //"\nOrder Value - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + orderValue.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            "\nGST(" + postData["tax-percent"] + "%) - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + response.taxAmt.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            "\n\n-----------------------------\n" +
            "💵TOTAL VALUE - " + GLOBAL.SEARCH.CURRENCY_SYMBOL + response.totalOrderValue.toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 }) +
            "\n-----------------------------\n"
            ;

        messages.message.attachment.payload["text"] = messageText;


        //set ordervalue
        postData["total-order-value"] = response.totalOrderValue;



        //create payment link
        const res = await createPaymentLink(postData);
        actions = res.actions;
        if (res.status != "created") {
            return {
                "actions": actions
            }
        }

        let buttons = [];

        buttons.push(
            {
                "title": GLOBAL.URL.PAYMENT_LINK_TEXT,
                "type": "web_url",
                "url": res["payment-link"]
            }
        );

        buttons.push(
            utils.createButtonOrQuickReply(
                "button",
                GLOBAL.FLOW.VIEW_CART.TEXT + "(" + cartData.cart.length + ")",
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.VIEW_CART.FLOW_ID],
            )
        );

        buttons.push(
            utils.createButtonOrQuickReply(
                "button",
                GLOBAL.FLOW.UPDATE_CONTACT_DETAILS.TEXT,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "callback_step_id", GLOBAL.FLOW.CHECKOUT.FLOW_ID],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.UPDATE_CONTACT_DETAILS.FLOW_ID],
            )
        );


        messages.message.attachment.payload["buttons"] = buttons;

    }

    return {
        "messages": [messages],
        "actions": actions
    };

}

function calculateOderValue(cartData, customerData) {
    let cartValue = 0;
    const cartItems = cartData.cart;
    const cartItemDetails = cartData["cart-details"];
    cartItems.forEach((item) => {
        const itemCount = cartItemDetails[item]["count"];
        const b2c_itemPrice = cartItemDetails[item]["price"];

        let itemTotalPrice = (b2c_itemPrice * itemCount);
        cartValue += itemTotalPrice;

    });

    const taxPercent = utils.parseToNumberOrDefault(customerData["tax-percent"]);
    const deliveryFee = utils.parseToNumberOrDefault(customerData["delivery-fee"]);
    const orderValue = (cartValue + deliveryFee);
    const taxAmt = Number(((orderValue * taxPercent) / 100).toFixed(2));
    const totalOrderValue = Number((orderValue + taxAmt).toFixed(2));
    return {
        "cartValue": cartValue,
        "taxAmt": taxAmt,
        "deliveryFee": deliveryFee,
        "totalOrderValue": totalOrderValue,
    };

}

async function createPaymentLink(postData) {

    try {
        const pgRes = await paymentService.createRazorPayPaymentLink(postData);
        if (pgRes["status"] == 'created') {

            return {
                "status": pgRes["status"],
                "payment-link": pgRes.short_url,
                "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_linkgeneration_error"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_status"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_id", postData["order-id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_link", pgRes.short_url],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_id", pgRes.id],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "total_order_value", postData["total-order-value"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG, "payment_in_progress"],
                )
            };
        } else {

            return {
                "status": pgRes["status"],
                "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_linkgeneration_error", pgRes.error.description],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.PAYMENT_LINK_ERROR],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_id"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "total_order_value", postData["total-order-value"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_link"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_id"],

                )
            };
        }
    } catch (e) {

        return {
            "status": "failed",
            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_linkgeneration_error", e.message],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.PAYMENT_LINK_ERROR],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_id"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "total_order_value", postData["total-order-value"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_link"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_id"],

            )
        };
    }



    return pgRes;
}

exports.returnErrorMessage = function (message) {

    return {
        "message": {
            "attachment": {
                "payload": {
                    "text": message,
                    "buttons": [{
                        "title": GLOBAL.FLOW.CONTINUE_SHOPPING.TEXT,
                        "payload": GLOBAL.FLOW.CONTINUE_SHOPPING.FLOW_ID,
                        "type": "postback"
                    }],
                    "template_type": "button"
                },
                "type": "template"
            }
        }
    };

}

exports.createOrderDetail = function (cartData) {

    const cartItems = cartData.cart;
    const cartItemDetails = cartData["cart-details"];

    let items = "";
    cartItems.forEach((item) => {
        const itemCount = cartItemDetails[item]["count"];
        const itemName = cartItemDetails[item]["name"];
        items = items + itemName + " x" + itemCount + "<br>"
    });

    return items;

}

exports.orderConfirmationAndPaymentLinkGeneration = function (cartData, postData) {


    const orderId = utils.generateUniqueSixDigitID();
    postData["order-id"] = orderId;

    const response = orderService.calculateOderValue(cartData, postData);


    if (utils.isJSON(response) && "actions" in response) {
        return value;
    }

    const orderDetails = {
        "customer-name": postData["customer-name"],
        "custome-phone": postData["customer-phoneno"],
        "customer-email": postData["customer-email"],
        "order-value": postData["total-order-value"],
        "order-date": utils.getCurrentDateTimeInISO(),
        "discount": 0,
        "order-status": GLOBAL.ORDER_STATUS.TO_BE_PROCESSED,

        "shipping-address": postData["customer-address"] + "," + postData["customer-postcode"],
        "items": cartData.cart,
        "item-details": cartData["cart-details"]
    };
}
