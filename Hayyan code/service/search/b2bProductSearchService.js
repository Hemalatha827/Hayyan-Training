const GLOBAL = require('../../GLOBAL_VARS.json');
const utils = require('../../utilities/utilitieFunc');

exports.dynamicSearchMessage = function (data, start, dataTotalCount, options) {
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
                        "elements": createSearchGallery(data, start, dataTotalCount),
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
            "quick_replies": createSearchQuickReplies(options)
        }
    });

    return messages;
}


function createSearchGallery(data, start, dataTotalCount) {
    const cards = [];

    data.forEach((item) => {
        const buttons = [];



        let btnTxt = GLOBAL.FLOW.SHOW_INTEREST.TEXT;
        let flowId = GLOBAL.FLOW.SHOW_INTEREST.FLOW_ID;

        buttons.push(
            utils.createButtonOrQuickReply(
                "button",
                btnTxt,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_id", item._source["id"]],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "product_item_name", item._source["product_name"]],
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


        let title = item._source["product_name"];

        let subTitle = "Starts from 🏷️" + GLOBAL.SEARCH.CURRENCY_SYMBOL + item._source["price"].toLocaleString(GLOBAL.SEARCH.CURRENCY_LOCAL_DENOMINATION, { style: 'decimal', useGrouping: true, minimumFractionDigits: 0 });

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
                    [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1703845361969"],

                )]
        };

        cards.push(card);
    }

    return cards;

}

function createSearchQuickReplies(options) {
    var quickReplies = [];


    options.forEach(function (element, index) {
        if (index < 10)
            quickReplies.push(utils.createButtonOrQuickReply(
                "qr",
                element,
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "card_search_index", 0],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "A1", element],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "Q1", "category"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF, "T1", "term"],
                [GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW, "1703845361969"]
            )
            );
    });

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
