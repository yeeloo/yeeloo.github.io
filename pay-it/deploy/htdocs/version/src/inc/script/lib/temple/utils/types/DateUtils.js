define(["require", "exports", "lib/temple/utils/TimeUnit"], function (require, exports, TimeUnit_1) {
    /**
     * This class contains some utility functions for Dates.
     *
     * @module Temple
     * @namespace temple.utils.types
     * @class DateUtils
     * @author Thijs Broerse
     */
    var DateUtils = (function () {
        function DateUtils() {
        }
        /**
         * Parse a SQL-DATETIME (YYYY-MM-DD HH:MM:SS) to a Date.
         *
         * @method parseFromSqlDateTime
         * @static
         * @param {string} dateTime An SQL-DATETIME (YYYY-MM-DD HH:MM:SS).
         * @return {Date|null} Date if successfully parsed, null otherwise.
         */
        DateUtils.parseFromSqlDateTime = function (value) {
            if (value == null) {
                return null;
            }
            value = value.replace(/-/g, '/');
            value = value.replace('T', ' ');
            value = value.replace('Z', ' GMT-0000');
            value = value.replace(/\.[0-9]{3}/g, '');
            var date = new Date(Date.parse(value));
            if (date.toString() == 'Invalid Date') {
                return null;
            }
            else {
                return date;
            }
        };
        /**
         * Try to convert a value to a date.
         *
         * @method convertToDate
         * @static
         * @param {any} value The value to convert to date.
         * @return {Date|null} Date if successfully converted, null otherwise.
         */
        DateUtils.convertToDate = function (value) {
            if (typeof value == 'number') {
                // The backend value is based in seconds
                return new Date((value) * 1000);
            }
            else if (typeof value == 'string') {
                // The date string is empty so return null
                if (value == '' || value == '0000-00-00 00:00:00') {
                    return null;
                }
                else {
                    return DateUtils.parseFromSqlDateTime(value);
                }
            }
            else if (value instanceof Date) {
                // If it is a Date, just return it (for internal use).
                return value;
            }
            return null;
        };
        /**
         * Returns a two digit representation of the year represented by the specified date.
         *
         * @method getShortYear
         * @static
         * @param {Date} date The Date instance whose year will be used to generate a two digit string representation of the year.
         * @return {string} A string that contains a 2 digit representation of the year. Single digits will be padded with 0.
         */
        DateUtils.getShortYear = function (date) {
            var year = date.getFullYear().toString();
            if (year.length < 3) {
                return year;
            }
            return (year.substr(year.length - 2));
        };
        /**
         * Compares two dates and returns an integer depending on their relationship.
         *
         * * Returns -1 if d1 is greater than d2.
         * * Returns 1 if d2 is greater than d1.
         * * Returns 0 if both dates are equal.
         *
         * @method compareDates
         * @static
         * @param {Date} date1 The date that will be compared to the second date.
         * @param {Date} date2 The date that will be compared to the first date.
         * @return {number} A number indicating how the two dates compare.
         */
        DateUtils.compareDates = function (date1, date2) {
            var d1ms = date1.getTime();
            var d2ms = date2.getTime();
            if (d1ms > d2ms) {
                return -1;
            }
            else if (d1ms < d2ms) {
                return 1;
            }
            else {
                return 0;
            }
        };
        /**
         * Returns a short hour (0 - 12) represented by the specified date.
         *
         * If the hour is less than 12 (0 - 11 AM) then the hour will be returned.
         *
         * If the hour is greater than 12 (12 - 23 PM) then the hour minus 12
         * will be returned.
         *
         * @method getShortHour
         * @static
         * @param {Date} date The Date from which to generate the short hour.
         * @return {number} An number between 0 and 13 ( 1 - 12 ) representing the short hour.
         */
        DateUtils.getShortHour = function (date) {
            var h = date.getHours();
            if (h == 0 || h == 12) {
                return 12;
            }
            else if (h > 12) {
                return h - 12;
            }
            else {
                return h;
            }
        };
        /**
         * Parses dates that conform to the W3C Date-time Format into Date objects.
         * This function is useful for parsing RSS 1.0 and Atom 1.0 dates.
         *
         * [Check for more information](http://www.w3.org/TR/NOTE-datetime)
         *
         * @method parseW3CDTF
         * @static
         * @param {string} value The value to parse.
         * @return {date}
         */
        DateUtils.parseW3CDTF = function (value) {
            var finalDate;
            try {
                var dateStr = value.substring(0, value.indexOf('T'));
                var timeStr = value.substring(value.indexOf('T') + 1, value.length);
                var dateArr = dateStr.split('-');
                var year = parseFloat(dateArr.shift());
                var month = parseFloat(dateArr.shift());
                var date = parseFloat(dateArr.shift());
                var multiplier;
                var offsetHours;
                var offsetMinutes;
                var offsetStr;
                if (timeStr.indexOf('Z') != -1) {
                    multiplier = 1;
                    offsetHours = 0;
                    offsetMinutes = 0;
                    timeStr = timeStr.replace('Z', '');
                }
                else if (timeStr.indexOf('+') != -1) {
                    multiplier = 1;
                    offsetStr = timeStr.substring(timeStr.indexOf('+') + 1, timeStr.length);
                    offsetHours = parseFloat(offsetStr.substring(0, offsetStr.indexOf(':')));
                    offsetMinutes = parseFloat(offsetStr.substring(offsetStr.indexOf(':') + 1, offsetStr.length));
                    timeStr = timeStr.substring(0, timeStr.indexOf('+'));
                }
                else {
                    multiplier = -1;
                    offsetStr = timeStr.substring(timeStr.indexOf('-') + 1, timeStr.length);
                    offsetHours = parseFloat(offsetStr.substring(0, offsetStr.indexOf(':')));
                    offsetMinutes = parseFloat(offsetStr.substring(offsetStr.indexOf(':') + 1, offsetStr.length));
                    timeStr = timeStr.substring(0, timeStr.indexOf('-'));
                }
                var timeArr = timeStr.split(':');
                var hour = parseFloat(timeArr.shift());
                var minutes = parseFloat(timeArr.shift());
                var secondsArr = (timeArr.length > 0) ? String(timeArr.shift()).split('.') : null;
                var seconds = (secondsArr != null && secondsArr.length > 0) ? parseFloat(secondsArr.shift()) : 0;
                var milliseconds = (secondsArr != null && secondsArr.length > 0) ? parseFloat(secondsArr.shift()) : 0;
                var utc = Date.UTC(year, month - 1, date, hour, minutes, seconds, milliseconds);
                var offset = (((offsetHours * 3600000) + (offsetMinutes * 60000)) * multiplier);
                finalDate = new Date(utc - offset);
                if (finalDate.toString() == 'Invalid Date') {
                    throw 'This date does not conform to W3CDTF.';
                }
            }
            catch (e) {
                var eStr = 'Unable to parse the string [' + value + '] into a date. ';
                eStr += 'The internal error was: ' + e;
                throw eStr;
            }
            return finalDate;
        };
        /**
         * Returns a date string formatted according to W3CDTF.
         *
         * [Check for more information](http://www.w3.org/TR/NOTE-datetime)
         *
         * @method toW3CDTF
         * @static
         * @param {Date} value The date to convert.
         * @param {boolean} [includeMilliseconds=false] Determines whether to include the milliseconds value (if any) in the formatted string.
         * @return {string}
         */
        DateUtils.toW3CDTF = function (value, includeMilliseconds) {
            if (includeMilliseconds === void 0) { includeMilliseconds = false; }
            var date = value.getUTCDate();
            var month = value.getUTCMonth();
            var hours = value.getUTCHours();
            var minutes = value.getUTCMinutes();
            var seconds = value.getUTCSeconds();
            var milliseconds = value.getUTCMilliseconds();
            var sb = '';
            sb += value.getUTCFullYear();
            sb += '-';
            //thanks to 'dom' who sent in a fix for the line below
            if (month + 1 < 10) {
                sb += '0';
            }
            sb += month + 1;
            sb += '-';
            if (date < 10) {
                sb += '0';
            }
            sb += date;
            sb += 'T';
            if (hours < 10) {
                sb += '0';
            }
            sb += hours;
            sb += ':';
            if (minutes < 10) {
                sb += '0';
            }
            sb += minutes;
            sb += ':';
            if (seconds < 10) {
                sb += '0';
            }
            sb += seconds;
            if (includeMilliseconds && milliseconds > 0) {
                sb += '.';
                sb += milliseconds;
            }
            sb += '-00:00';
            return sb;
        };
        /**
         * Determines the number of days between the start value and the end value. The result
         * may contain a fractional part, so cast it to int if a whole number is desired.
         *
         * @method countDays
         * @static
         * @param {Date} start The starting date of the range.
         * @param {Date} end The ending date of the range.
         * @return {number} the number of days between start and end.
         */
        DateUtils.countDays = function (start, end) {
            return Math.abs(end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24);
        };
        /**
         * Determines if the input year is a leap year (with 366 days, rather than 365).
         *
         * @method isLeapYear
         * @static
         * @param {number} year The year value as stored in a Date object.
         * @return {boolean}
         */
        DateUtils.isLeapYear = function (year) {
            if (year % 100 == 0) {
                return year % 400 == 0;
            }
            return year % 4 == 0;
        };
        /**
         * Rounds a Date value up to the nearest value on the specified time unit.
         *
         * @method roundUp
         * @static
         * @param {Date} dateToRound The date to round.
         * @param {string} [timeUnit='day'] The timeunit to round to.
         * @return {Date}
         */
        DateUtils.roundUp = function (dateToRound, timeUnit) {
            if (timeUnit === void 0) { timeUnit = 'day'; }
            dateToRound = new Date(dateToRound.valueOf());
            switch (timeUnit) {
                case TimeUnit_1.default.YEAR:
                    {
                        dateToRound.setFullYear(dateToRound.getFullYear() + 1);
                        dateToRound.setMonth(0);
                        dateToRound.setDate(1);
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.MONTH:
                    {
                        dateToRound.setMonth(dateToRound.getMonth() + 1);
                        dateToRound.setDate(1);
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.DAY:
                    {
                        dateToRound.setDate(dateToRound.getDate() + 1);
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.HOURS:
                    {
                        dateToRound.setHours(dateToRound.getHours() + 1);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.MINUTES:
                    {
                        dateToRound.setMinutes(dateToRound.getMinutes() + 1);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.SECONDS:
                    {
                        dateToRound.setSeconds(dateToRound.getSeconds() + 1);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.MILLISECONDS:
                    {
                        dateToRound.setMilliseconds(dateToRound.getMilliseconds() + 1);
                        break;
                    }
                default:
                    {
                        throw 'roundUp: unknown time unit "' + timeUnit + '"';
                        break;
                    }
            }
            return dateToRound;
        };
        /**
         * Rounds a Date value down to the nearest value on the specified time unit.
         *
         * @method roundDown
         * @static
         * @param {Date} dateToRound The date to round.
         * @param {string} [timeUnit='day'] The timeunit to round to.
         * @return {Date}
         */
        DateUtils.roundDown = function (dateToRound, timeUnit) {
            if (timeUnit === void 0) { timeUnit = 'day'; }
            dateToRound = new Date(dateToRound.valueOf());
            switch (timeUnit) {
                case TimeUnit_1.default.YEAR:
                    {
                        dateToRound.setMonth(0);
                        dateToRound.setDate(1);
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.MONTH:
                    {
                        dateToRound.setDate(1);
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.DAY:
                    {
                        dateToRound.setHours(0);
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.HOURS:
                    {
                        dateToRound.setMinutes(0);
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.MINUTES:
                    {
                        dateToRound.setSeconds(0);
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                case TimeUnit_1.default.SECONDS:
                    {
                        dateToRound.setMilliseconds(0);
                        break;
                    }
                default:
                    {
                        throw 'roundUp: unknown time unit "' + timeUnit + '"';
                        break;
                    }
            }
            return dateToRound;
        };
        /**
         * Converts a time code to UTC.
         *
         * @method timeCodeToUTC
         * @static
         * @param {string} timecode The input timecode.
         * @return {string} The UTC value.
         */
        DateUtils.timeCodeToUTC = function (timecode) {
            switch (timecode) {
                case 'GMT':
                case 'UT':
                case 'UTC':
                case 'WET':
                    return 'UTC+0000';
                case 'CET':
                    return 'UTC+0100';
                case 'EET':
                    return 'UTC+0200';
                case 'MSK':
                    return 'UTC+0300';
                case 'IRT':
                    return 'UTC+0330';
                case 'SAMT':
                    return 'UTC+0400';
                case 'YEKT':
                case 'TMT':
                case 'TJT':
                    return 'UTC+0500';
                case 'OMST':
                case 'NOVT':
                case 'LKT':
                    return 'UTC+0600';
                case 'MMT':
                    return 'UTC+0630';
                case 'KRAT':
                case 'ICT':
                case 'WIT':
                case 'WAST':
                    return 'UTC+0700';
                case 'IRKT':
                case 'ULAT':
                case 'CST':
                case 'CIT':
                case 'BNT':
                    return 'UTC+0800';
                case 'YAKT':
                case 'JST':
                case 'KST':
                case 'EIT':
                    return 'UTC+0900';
                case 'ACST':
                    return 'UTC+0930';
                case 'VLAT':
                case 'SAKT':
                case 'GST':
                    return 'UTC+1000';
                case 'MAGT':
                    return 'UTC+1100';
                case 'IDLE':
                case 'PETT':
                case 'NZST':
                    return 'UTC+1200';
                case 'WAT':
                    return 'UTC-0100';
                case 'AT':
                    return 'UTC-0200';
                case 'EBT':
                    return 'UTC-0300';
                case 'NT':
                    return 'UTC-0330';
                case 'WBT':
                case 'AST':
                    return 'UTC-0400';
                case 'EST':
                    return 'UTC-0500';
                case 'CST':
                    return 'UTC-0600';
                case 'MST':
                    return 'UTC-0700';
                case 'PST':
                    return 'UTC-0800';
                case 'YST':
                    return 'UTC-0900';
                case 'AHST':
                case 'CAT':
                case 'HST':
                    return 'UTC-1000';
                case 'NT':
                    return 'UTC-1100';
                case 'IDLW':
                    return 'UTC-1200';
            }
            return 'UTC+0000';
        };
        /**
         * Check if two dates are on the same day.
         *
         * @method isSameDay
         * @static
         * @param {Date} compare The first date to compare.
         * @param {Date} to The second date to compare.
         * @return {boolean}
         */
        DateUtils.isSameDay = function (compare, to) {
            if (compare.getFullYear() != to.getFullYear()) {
                return false;
            }
            if (compare.getMonth() != to.getMonth()) {
                return false;
            }
            if (compare.getDate() != to.getDate()) {
                return false;
            }
            return true;
        };
        /**
         * Determines the hours value in the range 1 - 12 for the AM/PM time format.
         *
         * @method getHoursIn12HourFormat
         * @static
         * @param {Date} date The input Date value.
         * @return {number} The calculated hours value.
         */
        DateUtils.getHoursIn12HourFormat = function (date) {
            var hours = date.getHours();
            if (hours == 0) {
                return 12;
            }
            if (hours > 0 && hours <= 12) {
                return hours;
            }
            return hours - 12;
        };
        /**
         * Calculates the age.
         *
         * @method age
         * @static
         * @param {Date} birthdate The birthdate to calculate the age for.
         * @param {Date} [on=null] Optional date on which the age is calculated. If null, the current date is used.
         * @return {number}
         */
        DateUtils.age = function (birthdate, on) {
            if (on === void 0) { on = null; }
            if (!on) {
                on = new Date();
            }
            var age = on.getFullYear() - birthdate.getFullYear();
            if (birthdate.getMonth() < on.getMonth()) {
                return age;
            }
            if (birthdate.getMonth() > on.getMonth()) {
                return age - 1;
            }
            if (birthdate.getDate() <= on.getDate()) {
                return age;
            }
            return age - 1;
        };
        /**
         * Checks if a date is the same as or older then a given years.
         *
         * @method ageCheck
         * @static
         * @param {Date} date The date to check.
         * @param {number} years The years to check the date on.
         * @return {boolean}
         */
        DateUtils.ageCheck = function (date, years) {
            return DateUtils.age(date) >= years;
        };
        /**
         * Checks if the current date is in summertime.
         *
         * @method isSummertime
         * @static
         * @param {Date} date The date to check.
         * @return {boolean}
         */
        DateUtils.isSummertime = function (date) {
            var currentOffset = date.getTimezoneOffset();
            var referenceOffset;
            var month = 1;
            while (month--) {
                referenceOffset = (new Date(date.getFullYear(), month, 1)).getTimezoneOffset();
                if (currentOffset != referenceOffset && currentOffset < referenceOffset) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Returns the unix timestamp (seconds since the 1st January 1970).
         *
         * @method getUnixTimestamp
         * @static
         * @param {Date} date The date to convert.
         * @return {string}
         */
        DateUtils.getUnixTimestamp = function (date) {
            return Math.floor(date.getTime() * 0.001).toString();
        };
        /**
         * Returns ISO8601 formated date, like 2008-05-22T19:15:21+02:00.
         *
         * @method getIso8601
         * @static
         * @param {Date} date The date to convert.
         * @return {string}
         */
        DateUtils.getIso8601 = function (date) {
            return date.getFullYear() + '-' + DateUtils.addLeadingZero(date.getMonth() + 1) + '-' + DateUtils.addLeadingZero(date.getDate()) + 'T' + DateUtils.addLeadingZero(date.getHours()) + ':' + DateUtils.addLeadingZero(date.getMinutes()) + ':' + DateUtils.addLeadingZero(date.getSeconds()) + DateUtils.getDifferenceBetweenGmt(date, ':');
        };
        /**
         * Returns the current timezone abbrevitation (such as EST, GMT, ...).
         *
         * @method getTimezone
         * @static
         * @param {Date} date The date to get the timezone from.
         * @return {string}
         */
        DateUtils.getTimezone = function (date) {
            var offset = Math.round(11 + -(date.getTimezoneOffset() / 60));
            if (DateUtils.isSummertime(date)) {
                offset--;
            }
            return DateUtils._TIMEZONES[offset];
        };
        /**
         * Returns the difference to the greenwich time (GMT), with optional
         * seperator between hours and minutes (such as +0200 or +02:00).
         *
         * @method getDifferenceBetweenGmt
         * @static
         * @param {Date} date The date to get the difference from.
         * @param {string} [seperator=''] The separator to split the hours and minutes.
         * @return {string}
         */
        DateUtils.getDifferenceBetweenGmt = function (date, separator) {
            if (separator === void 0) { separator = ''; }
            var timezoneOffset = -date.getTimezoneOffset();
            //sets the prefix
            var pre;
            if (timezoneOffset > 0) {
                pre = '+';
            }
            else {
                pre = '-';
            }
            var hours = Math.floor(timezoneOffset / 60);
            var min = timezoneOffset - (hours * 60);
            // building the return string
            var result = pre;
            if (hours < 9) {
                result += '0';
            }
            //adding leading zero to hours
            result += hours.toString();
            result += separator;
            if (min < 9) {
                result += '0';
            }
            //adding leading zero to minutes
            result += min;
            return result;
        };
        /**
         * Number of days in the current month (such as 28-31).
         *
         * @method getDaysOfMonth
         * @static
         * @param {Date} date The date to get the days from.
         * @return {number}
         */
        DateUtils.getDaysOfMonth = function (date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };
        /**
         * Returns the beats of the swatch internet time.
         *
         * @method getSwatchInternetTime
         * @static
         * @param {Date} date The date to convert.
         * @return {string}
         */
        DateUtils.getSwatchInternetTime = function (date) {
            // get passed seconds for the day
            var daySeconds = (date.getUTCHours() * 3600) + (date.getUTCMinutes() * 60) + (date.getUTCSeconds()) + 3600;
            // caused of the BMT Meridian
            // 1day = 1000 .beat ... 1 second = 0.01157 .beat
            return Math.round(daySeconds * 0.01157).toString();
        };
        /**
         * Returns a string indicating whether the date represents a time in the ante meridiem (AM) or post meridiem (PM).
         *
         * * If the hour is less than 12 then 'AM' will be returned.
         * * If the hour is greater than 12 then 'PM' will be returned.
         *
         * @method getAMPM
         * @static
         * @param date The date to get the AM or PM from.
         * @return {string} A string ('AM' or 'PM') indicating which half of the day the hour represents.
         */
        DateUtils.getAMPM = function (date) {
            return (date.getHours() > 11) ? 'PM' : 'AM';
        };
        /**
         * Returns the number of the current week for the year, a week starts with monday
         *
         * @method getWeekOfYear
         * @static
         * @param date The date to get the week of the year from.
         * @return {number}
         */
        DateUtils.getWeekOfYear = function (date) {
            //number of passed days
            var dayOfYear = DateUtils.getDayOfYear(date);
            //january 1st of the current year
            var firstDay = new Date(date.getFullYear(), 0, 1);
            // remove Days of the first and the current week to get the realy passed weeks
            var fullWeeks = (dayOfYear - (DateUtils._MONDAY_STARTING_WEEK[date.getDay()] + (7 - DateUtils._MONDAY_STARTING_WEEK[firstDay.getDay()]))) / 7;
            // the first week of this year only matters if it has more than 3 in the current year
            if (DateUtils._MONDAY_STARTING_WEEK[firstDay.getDay()] <= 4) {
                fullWeeks++;
            }
            //adding the current week
            fullWeeks++;
            return fullWeeks;
        };
        /**
         * Returns the day of the year, starting with 0 (0-365).
         *
         * @method getDayOfYear
         * @static
         * @param date The date to get the day of the year from.
         * @return {number}
         */
        DateUtils.getDayOfYear = function (date) {
            var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            var millisecondsOffset = date.getTime() - firstDayOfYear.getTime();
            return Math.floor(millisecondsOffset / 86400000);
        };
        /**
         * Gets the next date in the week for the given time and day. Useful for weekly countdowns.
         *
         * @method getNextInWeekDateFor
         * @static
         * @param {number} day The day for the countdown. 0 starts at sunday, so every monday at 20:00 is: getNextInWeekDatefor (1, 20);
         * @param {number} hours The hours of the time.
         * @param {number} [minutes=0] The minutes of the time.
         * @param {number} [seconds=0] The seconds of the time.
         * @return {Date}
         */
        DateUtils.getNextInWeekDateFor = function (day, hours, minutes, seconds) {
            if (minutes === void 0) { minutes = 0; }
            if (seconds === void 0) { seconds = 0; }
            var d = new Date();
            var targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, seconds);
            if (targetDate.getDay() != day) {
                targetDate.setDate(targetDate.getDate() + (((day + 7) - targetDate.getDay()) % 7));
            }
            else if (d.getTime() > targetDate.getTime()) {
                targetDate.setDate(targetDate.getDate() + 7);
            }
            return targetDate;
        };
        /**
         * Returns the difference in days between to days. Usefull for displaying a date like 'today', 'tomorrow' or 'yesterday'
         *
         * @method getDayDifference
         * @static
         * @param {Date} date1 The first date.
         * @param {Date} [date2=null] The second date. If second date is null the current date is used.
         * @return {number}
         */
        DateUtils.getDayDifference = function (date1, date2) {
            if (date2 === void 0) { date2 = null; }
            if (!date2) {
                date2 = new Date();
            }
            return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime() - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime()) / 86400000;
        };
        DateUtils.addLeadingZero = function (value) {
            return value < 10 ? '0' + value : value.toString();
        };
        /**
         * Total days in January.
         *
         * @static
         * @property DAYS_IN_JANUARY
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_JANUARY = 31;
        /**
         * Total days in February when it isn't a leap year.
         *
         * @static
         * @property DAYS_IN_FEBRUARY
         * @type number
         * @default 28
         */
        DateUtils.DAYS_IN_FEBRUARY = 28;
        /**
         * Total days in February when it is a leap year.
         *
         * @static
         * @property DAYS_IN_FEBRUARY_LEAP_YEAR
         * @type number
         * @default 29
         */
        DateUtils.DAYS_IN_FEBRUARY_LEAP_YEAR = 29;
        /**
         * Total days in March.
         *
         * @static
         * @property DAYS_IN_MARCH
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_MARCH = 31;
        /**
         * Total days in April.
         *
         * @static
         * @property DAYS_IN_APRIL
         * @type number
         * @default 30
         */
        DateUtils.DAYS_IN_APRIL = 30;
        /**
         * Total days in May.
         *
         * @static
         * @property DAYS_IN_MAY
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_MAY = 31;
        /**
         * Total days in June.
         *
         * @static
         * @property DAYS_IN_JUNE
         * @type number
         * @default 30
         */
        DateUtils.DAYS_IN_JUNE = 30;
        /**
         * Total days in July.
         *
         * @static
         * @property DAYS_IN_JULY
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_JULY = 31;
        /**
         * Total days in August.
         *
         * @static
         * @property DAYS_IN_AUGUST
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_AUGUST = 31;
        /**
         * Total days in September.
         *
         * @static
         * @property DAYS_IN_SEPTEMBER
         * @type number
         * @default 30
         */
        DateUtils.DAYS_IN_SEPTEMBER = 30;
        /**
         * Total days in October.
         *
         * @static
         * @property DAYS_IN_OCTOBER
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_OCTOBER = 31;
        /**
         * Total days in November.
         *
         * @static
         * @property DAYS_IN_NOVEMBER
         * @type number
         * @default 30
         */
        DateUtils.DAYS_IN_NOVEMBER = 30;
        /**
         * Total days in December.
         *
         * @static
         * @property DAYS_IN_DECEMBER
         * @type number
         * @default 31
         */
        DateUtils.DAYS_IN_DECEMBER = 31;
        /**
         * Total days in year when it isn't a leap year.
         *
         * @static
         * @property DAYS_IN_YEAR
         * @type number
         * @default 365
         */
        DateUtils.DAYS_IN_YEAR = 365;
        /**
         * Total days in year when it is a leap year.
         *
         * @static
         * @property DAYS_IN_LEAP_YEAR
         * @type number
         * @default 366
         */
        DateUtils.DAYS_IN_LEAP_YEAR = 366;
        /**
         * The number of days appearing in each month. May be used for easy index lookups.
         * The stored value for February corresponds to a standard year--not a leap year.
         *
         * @property DAYS_IN_MONTHS
         * @static
         * @type number[]
         */
        DateUtils.DAYS_IN_MONTHS = [DateUtils.DAYS_IN_JANUARY, DateUtils.DAYS_IN_FEBRUARY, DateUtils.DAYS_IN_MARCH, DateUtils.DAYS_IN_APRIL, DateUtils.DAYS_IN_MAY, DateUtils.DAYS_IN_JUNE, DateUtils.DAYS_IN_JULY, DateUtils.DAYS_IN_AUGUST, DateUtils.DAYS_IN_SEPTEMBER, DateUtils.DAYS_IN_OCTOBER, DateUtils.DAYS_IN_NOVEMBER, DateUtils.DAYS_IN_DECEMBER];
        /**
         * Timezone abbrevitations.
         */
        DateUtils._TIMEZONES = ['IDLW', 'NT', 'HST', 'AKST', 'PST', 'MST', 'CST', 'EST', 'AST', 'ADT', 'AT', 'WAT', 'GMT', 'CET', 'EET', 'MSK', 'ZP4', 'ZP5', 'ZP6', 'WAST', 'WST', 'JST', 'AEST', 'AEDT', 'NZST'];
        /**
         * Array to transform the format 0(sun)-6(sat) to 1(mon)-7(sun)
         */
        DateUtils._MONDAY_STARTING_WEEK = [7, 1, 2, 3, 4, 5, 6];
        return DateUtils;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DateUtils;
});
