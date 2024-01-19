const GLOBAL = require('../GLOBAL_VARS.json');
const utils = require('../utilities/utilitieFunc');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const addOrModifyCartService = require('../service/cart/addOrModifyCartService');
const viewCartService = require('../service/cart/viewCartService');
const removeCartService = require('../service/cart/removeCartService');


exports.viewCart = async (req, res) => {
    const postData = req.body;
    const PAGE_SIZE = 10;
    const PAGE_START = 0;
    const userData = postData["data"];
    const cart = await queryBuilderUtils.getElasticData(PAGE_START, PAGE_SIZE, userData, GLOBAL.SERVER.ZS_CART_INDEX, [], []);
    const cartData = cart.hits.total.value > 0 ? cart.hits.hits[0]["_source"] : { "cart": [] };

    const message = viewCartService.dynamicCartViewMessage(cartData, PAGE_START, cartData.cart.length);

    if (message.length > 1) {

        res.json({
            "messages": message
        });
        return;

    } else {

        res.json({
            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart_count", 0]
            )

        });
        return;
    }
};

exports.addOrModifyCart = async (req, res) => {
    const postData = req.body;

    //get exisiting details
    let elasticData = await queryBuilderUtils.getElasticData(0, 1, postData["search-data"], GLOBAL.SERVER.ZS_CART_INDEX, [], []);

    let isCartAvailable = false;
    if (elasticData !== null)
        isCartAvailable = elasticData.hits.hits.length == 1;

    let cartDetails = isCartAvailable ? elasticData.hits.hits[0]._source : {
        "cart": [],
        "cart-details": {}
    };

    const response = await addOrModifyCartService.addProduct(postData, cartDetails);

    const id = postData["product-id"];
    if (response != null) {

        res.json({

            "actions": utils.createCUFActions(
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart_count", cartDetails["cart"].length],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_count", cartDetails["cart-details"][id]["count"]]
            )

        });
        return;
    }
};

exports.removeFromCart = async (req, res) => {
    const postData = req.body;
    //get exisiting details
    const elasticData = await queryBuilderUtils.getElasticData(0, 1, postData["search-data"], GLOBAL.SERVER.ZS_CART_INDEX, [], []);

    let isCartAvailable = false;
    if (elasticData !== null) {
        isCartAvailable = elasticData.hits.hits.length == 1;
    }

    let cartCount = 0;
    if (isCartAvailable) {
        const userOrderDetails = elasticData.hits.hits[0]._source;
        removeCartService.removeItemFromCart(postData, userOrderDetails);
        cartCount = userOrderDetails["cart"].length;
    }

    res.json({

        "actions": utils.createCUFActions(
            [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "cart_count", cartCount]
        )

    });
    return;
};