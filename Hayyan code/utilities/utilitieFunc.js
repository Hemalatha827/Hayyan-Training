const CryptoJS = require('crypto-js');
const { parse } = require('date-fns');
const GLOBAL = require('../GLOBAL_VARS.json');

module.exports = {
    createCUFActions(...data) {

        const actions = [];

        for (const currentValue of data) {
            const operation = currentValue[0];
            if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SEND_FLOW,
                    "flow_id": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.ADD_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_TAG,
                    "tag_name": currentValue[1]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.SET_CUF,
                    "field_name": currentValue[1],
                    "value": currentValue[2]
                });
            } else if (operation == GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF) {
                actions.push({
                    "action": GLOBAL.BOTAMATION_CUF_DATA_PROCESSING.REMOVE_CUF,
                    "field_name": currentValue[1]
                });
            }

        }
        return actions;
    },

    createButtonOrQuickReply(type, displayTxt, ...data) {
        const actions = this.createCUFActions(...data);
        let buttonOrquickReply = {
            "title": displayTxt,
            "payload": JSON.stringify({ "actions": actions })
        };

        if (type == "button") {
            buttonOrquickReply.type = "postback";
        } else {
            buttonOrquickReply.content_type = "text";
        }

        return buttonOrquickReply;
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndCufInQuickReply(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": "set_field_value",
                "field_name": currentValue[0],
                "value": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var quickReplies = JSON.stringify({
            "actions": actions
        });

        var quickReply = {
            "content_type": "text",
            "title": title,
            "payload": quickReplies
        };
        return quickReply;
    },


    /**
    * @param {string} title
    * @param {number} flowId
    * @param {string[]} arg
    */
    setFlowIdAndTagInButtons(title, flowId, ...arg) {
        let actions = [];
        arg.forEach(function (currentValue) {
            actions.push({
                "action": currentValue[0] == "add" ? "add_tag" : "remove_tag",
                "tag_name": currentValue[1]
            });
        });

        actions.push(
            {
                "action": "send_flow",
                "flow_id": flowId //same flow called again just by updating the pageIndex
            }
        );

        var buttton = {
            "type": "postback",
            "title": title,
            "payload": JSON.stringify({ "actions": actions })
        };
        return buttton;
    },


    getRowNumByCellValue(values, searchValue) {

        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
            const row = values[rowIndex];
            const columnIndex = row.indexOf(searchValue);
            if (columnIndex !== -1) {
                const rowNum = rowIndex + 1; // Adding 1 because row index is 0-based, but row numbers are 1-based in Sheets
                return rowNum; // If you want to use this value further, you can return it from the function
            }
        }

        Logger.log(`'${searchValue}' not found in the sheet.`);
        return null; // If the value is not found, you can return null or any other value indicating that it's not present in the sheet.
    },

    getValueBasedOnAnotherColumn(data, searchColumn, searchValue) {
        let targetValue;
        const header = data[1];

        // Iterate over the rows and find the matching value in the search column
        for (let i = 2; i < data.length; i++) {
            if (String(data[i][header.indexOf(searchColumn)]) == String(searchValue)) {
                targetValue = data[i];
                break;
            }
        }

        var targetData = {};
        if (targetValue != null)
            targetValue.forEach((element, index) => {
                targetData[header[index]] = element;
            });

        return targetData;
    },

    getRangeBasedOnValue(data, searchValue, searchType) {

        // Iterate over the rows and find the matching value in the search column
        for (let i = 2; i < data.length; i++) {
            const lowerBound = data[i][1];
            const upperBound = data[i][2];
            const type = data[i][3];

            if (type === searchType) {
                if (lowerBound !== '-' && upperBound !== '-') {
                    if (searchValue >= lowerBound && searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (lowerBound === '-') {
                    if (searchValue <= upperBound) {
                        return data[i][0];
                    }
                } else if (upperBound === '-') {
                    if (searchValue >= lowerBound) {
                        return data[i][0];
                    }
                }
            }
        }

    },

    generateUniqueSixDigitID() {
        const timestamp = Date.now().toString(); // Get the current timestamp
        const randomPart = Math.floor(Math.random() * 900000) + 100000; // Random 6-digit number
        const uniqueID = timestamp.slice(-6) + randomPart.toString();
        return uniqueID.slice(0, 6); // Ensure it's exactly 6 digits long
    },

    getCurrentDateTimeInISO() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    },

    isProductStillAvailable(dateTime, validityInMins) {
        return this.isTimeDifferenceWithinLimit(dateTime, this.getCurrentDateTimeInISO(),
            validityInMins);

    },

    isTimeDifferenceWithinLimit(dateTime1, dateTime2, validityInMins) {
        const timeDiff = this.timeDifferenceInMinutes(dateTime1, dateTime2);

        return timeDiff <= validityInMins;
    },

    isDeliveryTimeStillValid(dateTime1, dateTime2, validityInMins) {
        const timeDiff = this.timeDifferenceInMinutes(dateTime1, dateTime2);

        return timeDiff >= validityInMins;
    },

    timeDifferenceInMinutes(dateTime1, dateTime2) {
        const date1 = parse(dateTime1, "dd.MM.yyyy h:mm a", new Date());
        const date2 = parse(dateTime2, "dd.MM.yyyy h:mm a", new Date());

        const timeDifferenceInMilliseconds = date1 - date2;
        return timeDifferenceInMilliseconds / (1000 * 60);
    },

    getUnixTimestampExpiryFromNow(expiryInMins) {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + expiryInMins * 60 * 1000); // Adding 1 hour in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getUnixTimestamp30MinutesFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 60 * 1000); // Adding 30 minutes in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    getUnixTimestamp1HourFromNow() {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Adding 1 hour in milliseconds
        const unixTimestamp = Math.floor(futureDate.getTime() / 1000); // Convert to Unix timestamp (seconds)

        return unixTimestamp;
    },

    isToday(dateToCheck) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // January is 0, so we add 1
        const day = today.getDate();

        const [dd, mm, yyyy] = dateToCheck.split('.');

        return yyyy == year && mm == month && dd == day;
    },


    validateCreditCard(cardNumber) {
        const regex = /^(\d{4}\s?){4}$/;
        return regex.test(cardNumber);
    },

    validateCreditCardMonth(month) {
        const regex = /^(0[1-9]|1[0-2])$/;
        return regex.test(month);
    },

    formatCreditCardMonth(month) {
        return month.length === 1 ? "0" + month : month;
    },

    validateYear(year) {
        const regex = /^\d{4}$/; // Matches exactly 4 digits
        const currentYear = new Date().getFullYear();
        return regex.test(year) && parseInt(year) >= currentYear;
    },

    validateCVV(cvv) {
        const regex = /^\d{3}$/; // Matches exactly 3 digits
        return regex.test(cvv);
    },

    encryptCreditCardNumber(creditCardNumber) {
        try {
            const key = CryptoJS.enc.Utf8.parse(String(GLOBAL.CC_ENCRYPTION.KEY));
            const iv = CryptoJS.enc.Utf8.parse(String(GLOBAL.CC_ENCRYPTION.IV));

            // Encrypting
            const encryptedCard = CryptoJS.AES.encrypt(creditCardNumber, key, { iv }).toString();
            return encryptedCard;
        } catch (e) {
            return null;
        }
    },


    decryptCreditCardNumber(encryptedData) {
        try {
            const key = CryptoJS.enc.Utf8.parse(String(GLOBAL.CC_ENCRYPTION.KEY));
            const iv = CryptoJS.enc.Utf8.parse(String(GLOBAL.CC_ENCRYPTION.IV));

            var cardNumber = CryptoJS.enc.Utf8.stringify(
                CryptoJS.AES.decrypt(encryptedData, key, { iv })
            );

            return cardNumber;
        } catch (e) {
            return null;
        }
    },


    generateTimeSlots(openingHours, closingHours, currentTime) {
        const timeSlots = [];
        const startTime = new Date(`2023-01-01 ${openingHours}`);
        startTime.setMinutes(startTime.getMinutes() + 30);

        const endTime = new Date(`2023-01-01 ${closingHours}`);
        endTime.setMinutes(endTime.getMinutes() - 30);

        //const deliveryDateTime = new Date(`2023-01-01 ${currentTime}`);
        let roundedCurrentTime = new Date(Math.ceil(new Date(`2023-01-01 ${currentTime}`).getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000));

        if (roundedCurrentTime < startTime) {
            const diff = (startTime - roundedCurrentTime) / (60 * 1000);
            roundedCurrentTime = startTime;
            if (diff >= 60) {

                roundedCurrentTime.setMinutes(startTime.getMinutes() - 60);
            } else {
                roundedCurrentTime.setMinutes(startTime.getMinutes() - 30);
            }
        }

        if (roundedCurrentTime > endTime) {
            return timeSlots; // Return an empty array if delivery time is outside the specified range
        }

        const initialSlot = new Date(roundedCurrentTime);
        initialSlot.setHours(initialSlot.getHours() + 1);

        while (initialSlot <= endTime) {
            //const roundedTime = new Date(Math.ceil(initialSlot.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000));
            const formattedTime = initialSlot.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            timeSlots.push(formattedTime);

            initialSlot.setMinutes(initialSlot.getMinutes() + 30);
        }

        return timeSlots;
    },


    getSlicedArrayBasedOnIndex(array, index) {
        return array.slice(index * (GLOBAL.SEARCH.MAX_PAGE_SIZE - 1));
    },

    parseToNumberOrDefault(inputValue, defaultValue = 0) {
        return isNaN(inputValue) || inputValue === "" ? defaultValue : parseFloat(inputValue);
    },

    isJSON(value) {
        try {
            JSON.parse(value);
            return true;
        } catch (error) {
            return false;
        }
    },

    isNumber(value) {
        return !isNaN(value) && typeof value !== 'boolean';
    }
};

