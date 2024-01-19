const GLOBAL = require('../GLOBAL_VARS.json');
const utils = require("../utilities/utilitieFunc");
const fetch = require('isomorphic-fetch');

exports.createRazorPayPaymentLink = function (data) {
    const url = GLOBAL.PAYTMENT.LINK_GENERATOR_API;
    const amount = data["total-order-value"] * 100;
    const payload = {
        "amount": Math.floor(amount),
        "currency": GLOBAL.PAYTMENT.CURRENCY,
        "accept_partial": false,
        "expire_by": utils.getUnixTimestampExpiryFromNow(data["payment-link-expiry-mins"]),
        "reference_id": data["order-id"],
        "description": "Payment for HAYYAN OILS Order No #" + data["order-id"],
        "customer": {
            "name": data["customer-name"],
            "contact": data["customer-phoneno"],
            "email": data["customer-email"]
        },
        "notify": {
            "sms": true,
            "email": true,
            "whatsapp": true
        },
        "reminder_enable": true,
        "notes": {
            "order-id": data["order-id"],
            "user-id": data["user-id"],
            "acct-id": data["acct-id"],
            "botamation-api": data["botamation-key"],
            "flow-id": data["payment-status-flow-id"]
        }
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + data["pg-auth-token"]
        }
    };
    return fetch(url, options)
        .then(response => response.json());
}


exports.createStripePaymentToken = function (data) {
    const url = GLOBAL.PAYTMENT.STRIPE_CREATE_TOKEN;
    const creditCardNumber = utils.decryptCreditCardNumber(data["credit-card-encrypted"]);
    const options = {
        method: 'POST',
        body: 'card[number]=' + creditCardNumber + '&card[exp_month]=' + data["credit-card-month"] + '&card[exp_year]=' + data["credit-card-year"] + '&card[cvc]=' + data["credit-card-cvv"], // Your x-www-form-urlencoded entries
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Set the content type for x-www-form-urlencoded
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data["stripe-publish-key"]
        }
    };
    return fetch(url, options)
        .then(response => response.json());
}

exports.stripeChargeCard = function (data) {
    const url = GLOBAL.PAYTMENT.STRIPE_CREATE_CHARGE;
    const totalOrderValue = Math.floor(data["total-order-value"] * 100);
    const options = {
        method: 'POST',
        body: 'source=' + data["stript-token"] + '&currency=' + data["payment-currency"] + '&amount=' + totalOrderValue + '&description=Order refno #' + data["order-id"], // Your x-www-form-urlencoded entries
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Set the content type for x-www-form-urlencoded
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + data["stripe-secret-key"]
        }
    };
    return fetch(url, options)
        .then(response => response.json());
}