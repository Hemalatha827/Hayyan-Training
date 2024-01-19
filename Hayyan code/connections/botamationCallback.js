const GLOBAL = require('../GLOBAL_VARS.json');
const fetch = require('isomorphic-fetch');

exports.recordPaymentConformation = function (data) {
    const url = "https://app.botamation.in/api/users/" + data.payload.payment_link.entity.notes["user-id"] + "/send_content";
    const payload = {
        "actions": [{
            "action": "set_field_value",
            "field_name": "payment_status",
            "value": data.payload.payment_link.entity.status
        }, {
            "action": "set_field_value",
            "field_name": "payment_gateway_order_id",
            "value": data.payload.payment_link.entity.notes["order-id"]
        }, {
            "action": "remove_tag",
            "tag_name": "payment_in_progress"
        }, {
            "action": "send_flow",
            "flow_id": data.payload.payment_link.entity.notes["flow-id"]
        }]
    };


    const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'X-ACCESS-TOKEN': data.payload.payment_link.entity.notes["botamation-api"]
        }
    };

    return fetch(url, options)
        .then(response => response.json());
}

