const GLOBAL = require('../GLOBAL_VARS.json');
const queryBuilderUtils = require('../utilities/zincQueryBuilder');
const productSearchService = require('../service/search/productSearchService');
const b2bProductSearchService = require('../service/search/b2bProductSearchService');
const sizeService = require('../service/search/sizeSearchService');


/*
    B2C search
    Show all  items related to the search catagory / show all items in a pagaination 
*/
exports.productSeacrh = async (req, res) => {
    const postData = req.body;
    const PAGE_START = Number(postData.start);
    const currentTime = postData["current-time"];
    const validity = postData["item-validity"];
    const cartCount = postData["cart_count"];

    const sortFields = [];
    let searchFields = [];
    postData["data"].forEach(function (e) {
        if (e.value && e.value != "-") {
            sortFields.push(e.query);
            searchFields.push(e);
        }
    });


    const elasticData = await queryBuilderUtils.getElasticData(PAGE_START, GLOBAL.SEARCH.MAX_PAGE_SIZE, searchFields, GLOBAL.SERVER.ZS_PRODUCT_INDEX, [], sortFields);

    let cartData = { "cart": [] };
    if (cartCount > 0) {
        const cartQuery = [
            {
                "query": "id",
                "value": postData["user-id"],
                "type": "match"
            }];
        const cart = await queryBuilderUtils.getElasticData(0, 1, cartQuery, GLOBAL.SERVER.ZS_CART_INDEX, [], []);

        if (cart.hits.total.value > 0) {
            cartData = cart.hits.hits[0]["_source"];
        }
    }

    const data = elasticData.hits.hits;
    const dataTotalCount = Number(elasticData.hits.total.value);

    let options = JSON.parse(postData["options"]);

    options = options.filter(oil => oil !== postData["data"][0]["value"]);

    const message = productSearchService.dynamicSearchMessage(data, cartData, PAGE_START, dataTotalCount, options, currentTime, validity);
    const dynamicContent = {
        "messages": message
    };

    res.json(dynamicContent);
};

/**
 * B2B Product Search
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.b2bProductSeacrh = async (req, res) => {
    const postData = req.body;
    const PAGE_START = Number(postData.start);

    const sortFields = [];
    let searchFields = [];
    postData["data"].forEach(function (e) {
        if (e.value && e.value != "-") {
            sortFields.push(e.query);
            searchFields.push(e);
        }
    });

    const elasticData = await queryBuilderUtils.getElasticData(PAGE_START, GLOBAL.SEARCH.MAX_PAGE_SIZE, searchFields, GLOBAL.SERVER.ZS_B2B_PRODUCT_INDEX, [], sortFields);


    const data = elasticData.hits.hits;
    const dataTotalCount = Number(elasticData.hits.total.value);

    let options = JSON.parse(postData["options"]);

    options = options.filter(oil => oil !== postData["data"][0]["value"]);

    const message = b2bProductSearchService.dynamicSearchMessage(data, PAGE_START, dataTotalCount, options);
    const dynamicContent = {
        "messages": message
    };

    res.json(dynamicContent);
};

/*
    Show available size related to an item
*/
exports.sizeSearch = async (req, res) => {
    const postData = req.body;
    const cartCount = postData["cart_count"];
    const elasticData = await queryBuilderUtils.getElasticData(0, GLOBAL.SEARCH.MAX_PAGE_SIZE, postData.data, GLOBAL.SERVER.ZS_PRODUCT_SIZE_INDEX, [], []);


    let cartData = { "cart": [] };
    if (cartCount > 0) {
        const cartQuery = [
            {
                "query": "id",
                "value": postData["user-id"],
                "type": "match"
            }];
        const cart = await queryBuilderUtils.getElasticData(0, 1, cartQuery, GLOBAL.SERVER.ZS_CART_INDEX, [], []);

        if (cart.hits.total.value > 0) {
            cartData = cart.hits.hits[0]["_source"];
        }
    }

    const data = elasticData.hits.hits;
    const dataTotalCount = Number(elasticData.hits.total.value);

    const message = sizeService.dynamicSizeSearchMessage(data, cartData, 0, dataTotalCount);
    const dynamicContent = {
        "messages": message
    };

    res.json(dynamicContent);
};