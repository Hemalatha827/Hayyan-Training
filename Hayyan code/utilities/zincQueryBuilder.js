const zinc = require("../connections/zincConnector");

exports.getElasticCustomAggsDataWithCriteria = function (searchData, aggField, index) {
    const query = queryBuilder(searchData);

    const payload = {
        "size": 0,
        "query": query,
        "aggs": aggField
    };

    const response = zinc.zincSelect(payload, index)

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}

exports.getElasticAggsDataWithCriteria = function (searchData, aggField, index) {
    const query = queryBuilder(searchData);

    const payload = {
        "from": 0,
        "size": 0,
        "query": query,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    const response = zinc.zincSelect(payload, index);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}

exports.getElasticAggsData = function (aggField, index) {
    var payload = {
        "from": 0,
        "size": 0,
        "aggs": {
            "text": {
                "terms": {
                    "field": aggField
                }
            }
        }
    };

    const response = zinc.zincSelect(payload, index)

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    }
}

exports.insertIntoZs = function (data, index, docId) {
    return zinc.zincUpdate(data, index, docId)

}


exports.removeDocFromZs = function (index, docId) {
    return zinc.zincRemove(index, docId)
}


exports.getElasticData = function (start, size, searchData, index, fetchFields, sortFields, searchType = "MUST") {


    const query = queryBuilder(searchData, searchType);

    if (fetchFields === undefined || fetchFields === null) {
        fetchFields = [];
    }


    if (sortFields === undefined || sortFields === null) {
        sortFields = ["id"];
    } else {
        sortFields.push("id");
    }

    var payload = {
        "from": start,
        "size": size,
        "query": query,
        "_source": fetchFields,
        "sort": sortFields
    };

    return zinc.zincSelect(payload, index);
}


function queryBuilder(searchData, searchType) {
    var searchCriteria = [];
    var query = {
        "bool": {
            [searchType]: searchCriteria
        }
    };

    for (const e of searchData) {
        const filter = e["query"];
        const filterType = e["type"];
        const filterValue = e["value"];
        if (filterValue) {
            searchCriteria.push(buildSubQuery(filter, filterType, filterValue));
        }
    }

    if (searchCriteria.length == 0) {
        var query = {
            "match_all": {}
        }
    }

    return query;
}

function buildSubQuery(filter, filterType, filterValue) {
    var subQuery;
    var rValue;

    if (filterType == 'range') {
        //Re-map the range values
        const sheet = SpreadsheetApp.getActive().getSheetByName(filter);
        const sheetData = sheet.getDataRange().getValues();

        var filterRange = getValueBasedOnAnotherColumn(sheetData, "Options", filterValue);
        const filterVal1 = filterRange['Lower bound'];
        const filterVal2 = filterRange['Lower bound'];

        if (filterVal2 === '-') {
            rValue = {
                "gte": filterVal1
            };
        } else if (filterVal1 === '-') {
            rValue = {
                "lte": filterVal2
            };
        } else {
            rValue = {
                "gte": filterVal1,
                "lte": filterVal2
            };
        }
        subQuery = {
            [filter]: rValue
        }
    } else if (filterType == 'term') {
        filter = filter + ".keyword";
        subQuery = {
            [filter]: filterValue
        }
    } else if (filterType == 'match' || filterType == 'match_phrase') {
        subQuery = {
            [filter]: filterValue
        }
    } else if (filterType == 'fuzzy') {
        subQuery = {
            [filter]: filterValue.toLowerCase()
        }
    }

    return {
        [filterType]: subQuery
    };
}

