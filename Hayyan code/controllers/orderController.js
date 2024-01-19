const GLOBAL = require('../GLOBAL_VARS.json');
const utils = require('../utilities/utilitieFunc');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const orderService = require('../service/order/orderService');
const paymentService = require('../connections/paymentConnector');
const botamationCallback = require('../connections/botamationCallback');

exports.prepareOrder = async (req, res) => {
    const postData = req.body;
    let cart = await queryBuilderUtils.getElasticData(0, 1, [postData["user-data"]], GLOBAL.SERVER.ZS_CART_INDEX, [], []);
    const cartData = cart.hits.total.value > 0 ? cart.hits.hits[0]["_source"] : { "cart": [] };

    const dynamicContent = await orderService.createCheckoutData(cartData, postData);

    res.json(dynamicContent);
}

exports.createPaymentLink = async (req, res) => {
    const postData = req.body;

    try {
        if (!postData["cart_count"]) {
            const messages = {
                "message": {
                    "quick_replies": []
                }
            }
            messages.message["text"] = "Your cart is empty!"

            const quickReplies = [];

            quickReplies.push(
                utils.createButtonOrQuickReply(
                    "qr",
                    GLOBAL.FLOW.CONTINUE_SHOPPING.TEXT,
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, GLOBAL.FLOW.CONTINUE_SHOPPING.FLOW_ID],
                )
            );

            messages.message["quick_replies"] = quickReplies;

            res.json({
                "messages": [messages]
            });
            return;
        }

        const orderId = utils.generateUniqueSixDigitID();
        postData["order-id"] = orderId;

        const pgRes = await paymentService.createRazorPayPaymentLink(postData);

        if (pgRes["status"] == 'created') {

            res.json({
                "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_linkgeneration_error"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_status"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_id", postData["order-id"]],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_link", pgRes.short_url],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_id", pgRes.id],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG, "payment_in_progress"],
                )
            });
            return;
        } else {
            res.json({
                "actions": utils.createCUFActions(
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_linkgeneration_error", pgRes.error.description],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.PAYMENT_LINK_ERROR],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_id"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_link"],
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_id"],

                )
            });
            return;
        }

    } catch (e) {
        res.json({
            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "payment_linkgeneration_error", e.message],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.PAYMENT_LINK_ERROR],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "hayyan_order_id"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_link"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF, "payment_id"],

            )
        });
        return;
    }

}


exports.paymentWebhook = (req, res) => {
    const postData = req.body;

    botamationCallback.recordPaymentConformation(postData);

    res.status(200).send('OK');
    return;
}

exports.processOrderAndTriggerEmail = async (req, res) => {
    try {
        const postData = req.body;
        let cart = await queryBuilderUtils.getElasticData(0, 1, [postData["user-data"]], GLOBAL.SERVER.ZS_CART_INDEX, [], []);

        const cartData = (cart != null && cart.hits.total.value > 0) ? cart.hits.hits[0]["_source"] : { "cart": [] };

        if (cartData.cart.length == 0) {
            res.json({
                "messages": [orderService.returnErrorMessage(GLOBAL.MESSAGE.CART_EMPTY)]
            });
            return;
        }

        const orderDetails = {
            "customer-name": postData["customer-name"],
            "custome-phone": postData["customer-phoneno"],
            "customer-email": postData["customer-email"],
            "order-value": postData["total-order-value"],
            "order-date": utils.getCurrentDateTimeInISO(),
            "discount": 0,
            "order-status": GLOBAL.ORDER_STATUS.TO_BE_PROCESSED,
            "order-id": postData["order-id"],
            "shipping-address": postData["customer-address"] + "," + postData["customer-postcode"],
            "items": cartData.cart,
            "item-details": cartData["cart-details"]
        };

        let existingOrders = await queryBuilderUtils.getElasticData(0, 1, [postData["user-data"]], GLOBAL.SERVER.ZS_ORDERS_INDEX, [], []);
        let userOrders;
        if (existingOrders == null || existingOrders.hits.total.value == 0) {
            userOrders = {
                "user-id": postData["user-data"].value,
                "ongoing-orders": [],
                "ongoing-order-details": {}
            }
        } else {
            userOrders = existingOrders.hits.hits[0]["_source"];
        }

        let itemList = orderService.createOrderDetail(cartData);

        userOrders["ongoing-orders"].push(postData["order-id"]);
        userOrders["ongoing-order-details"][postData["order-id"]] = orderDetails;

        queryBuilderUtils.insertIntoZs(userOrders, GLOBAL.SERVER.ZS_ORDERS_INDEX, postData["user-data"].value);
        queryBuilderUtils.removeDocFromZs(GLOBAL.SERVER.ZS_CART_INDEX, postData["user-data"].value);


        res.json({
            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "last_order_details", itemList],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.TO_BE_PROCESSED],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart_count", 0]
            )

        });
        return;
    } catch (error) {
        res.json({
            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "last_order_details", itemList],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "hayyan_order_status", GLOBAL.ORDER_STATUS.UNEXPECTED_ERROR],
            )
        });
        return;
    }

}
