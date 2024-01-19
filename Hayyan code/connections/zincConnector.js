
const GLOBAL = require('../GLOBAL_VARS.json');
const fetch = require('isomorphic-fetch');

exports.zincSelect = function (payload, index) {
    const url = GLOBAL.SERVER.ZS_SERVER + "/es/" + index + "/_search";
    const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + GLOBAL.SERVER.ZS_AUTH
        }
    };
    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json())
        // .catch(error => {
        //     console.error('Error:', error)
        //     return null;
        // })
        ;

}


exports.zincUpdate = function (payload, index, id) {
    return exports.zincUpdateOrDelete(payload, index, id, "PUT");
}

exports.zincDeleteIndex = function (index) {
    const url = GLOBAL.SERVER.ZS_SERVER + "/api/index/" + index;
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + GLOBAL.SERVER.ZS_AUTH
        }
    };

    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json())
        // .catch(error => {
        //     console.error('Error:', error);
        //     return null;
        // })
        ;
}

exports.zincRemove = function (index, id) {
    const url = GLOBAL.SERVER.ZS_SERVER + "/api/" + index + "/_doc/" + id;
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + GLOBAL.SERVER.ZS_AUTH
        }
    };

    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json())
        // .catch(error => {
        //     console.error('Error:', error);
        //     return null;
        // })
        ;
}

exports.zincUpdateOrDelete = function (payload, index, id, method) {
    const url = GLOBAL.SERVER.ZS_SERVER + "/api/" + index + "/_doc/" + id;
    const options = {
        method: method,
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + GLOBAL.SERVER.ZS_AUTH
        }
    };

    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json())
        // .catch(error => {
        //     console.error('Error:', error);
        //     return null;
        // })
        ;
}


exports.zincBulkCreateOrUpdate = function (payload) {
    const url = GLOBAL.SERVER.ZS_SERVER + "/api/_bulkv2";
    const options = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + GLOBAL.SERVER.ZS_AUTH
        }
    };

    // Attempting some risky operation
    return fetch(url, options)
        .then(response => response.json())
        // .catch(error => {
        //     console.error('Error:', error);
        //     return null;
        // })
        ;
}
