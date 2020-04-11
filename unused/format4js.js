/*
 * Copyright (c) 2011 Hidenori Sugiyama
 *
 * Java's String.format() like string formatting library.
 *
 * Licensed under the MIT license.
 */

// namespace f4js
(typeof f4js != 'undefined') ? null : f4js = {};

(function() {

    /*
     * Public interface
     */

    // "fmt".format(args...)
    if (typeof String.prototype.format == 'undefined') {
        String.prototype.format = function() {
            var args = Array.prototype.slice.apply(arguments).slice(0);

            var formatter = new Formatter();
            return formatter.doFormat(this, args);
        }
    }

    // String.format("fmt", args...)
    if (typeof String.format == 'undefined') {
        String.format = function(fmt) {
            var args = Array.prototype.slice.apply(arguments).slice(1);

            var formatter = new Formatter();
            return formatter.doFormat(fmt, args);
        }
    }

    // f4js.format("fmt", args...)
    if (typeof f4js != 'undefined') {
        f4js.format = function(fmt, args) {
            var formatter = new Formatter();
            return formatter.doFormat(fmt.toString(), args);
        }
    }


    /*
     * Utilities
     */
    function multiplePush(v, c, len) {
        for(var i = 0; i < len; i++) {
            v.push(c);
        }
        return v;
    }

    function paddingLeft(str, pad, len) {
        return (multiplePush(Array(), pad, len).join('') + str).slice(-len);
    }

    function paddingRight(str, pad, len) {
        return (str + multiplePush(Array(), pad, len).join('')).slice(0, len);
    }

    function insertThousandsSeparator(str, separator) {
        var offset = str.length % 3;
        var array = str.slice(offset).split(/(.{3})/);
        array.unshift(str.slice(0, offset));

        var res = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i]) {
                res.push(array[i]);
            }
        }
        return res.join(separator);
    }

    /*
     * String representation of date
     */
    var monthMapLong = {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December'
    };

    var monthMapShort = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    };

    var dayOfWeekMapLong = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
    };

    var dayOfWeekMapShort = {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat'
    };


    /*
     * class DateAndTimeConverter
     */
    var DateAndTimeConverter = function(isUpperCase) {
        this.isUpperCase = isUpperCase;
    };

    DateAndTimeConverter.prototype.convert = function(argument, flags, width, conversion) {
        var converted = '';

        switch(conversion.charAt(1)) {
          case 'H':
            converted = paddingLeft(argument.getHours(), '0', 2);
            break;
          case 'I':
            converted = paddingLeft(((argument.getHours() - 1) % 12) + 1, '0', 2);
            break;
          case 'k':
            converted = argument.getHours();
            break;
          case 'l':
            converted = ((argument.getHours() - 1) % 12) + 1;
            break;
          case 'M':
            converted = paddingLeft(argument.getMinutes(), '0', 2);
            break;
          case 'S':
            converted = paddingLeft(argument.getSeconds(), '0', 2);
            break;
          case 'L':
            converted = paddingLeft(argument.getMilliseconds(), '0', 3);
            break;
          case 'N':
            // javascript hasn't nanoseconds
            throw new Error('unsupported time format: N');
          case 'p':
            var hour = argument.getHours();
            converted = (hour == 24 || hour < 13) ? 'am' : 'pm';
            if (conversion.charAt(0) == 'T') {
                converted = converted.toUpperCase();
            }
            break;
          case 'z':
            var offset = argument.getTimezoneOffset();
            var sign = (offset > 0) ? '-' : '+';
            converted = sign + paddingLeft(Math.abs(offset) / 60 * 100, '0', 4);
            break;
          case 'Z':
            // javascript hasn't timezone info
            throw new Error('unsupported time format: Z');
          case 's':
            converted = Math.floor(argument.getTime() / 1000);
            break;
          case 'Q':
            converted = argument.getTime();
            break;
          case 'B':
            converted = monthMapLong[argument.getMonth()];
            break;
          case 'b':
          case 'h':
            converted = monthMapShort[argument.getMonth()];
            break;
          case 'A':
            converted = dayOfWeekMapLong[argument.getDay()];
            break;
          case 'a':
            converted = dayOfWeekMapShort[argument.getDay()];
            break;
          case 'C':
            var year = argument.getFullYear();
            converted = paddingLeft(Math.floor(year / 100), '0', 2);
            break;
          case 'Y':
            converted = paddingLeft(argument.getFullYear(), '0', 4);
            break;
          case 'y':
            converted = paddingLeft(argument.getYear(), '0', 2);
            break;
          case 'j':
            var base = new Date(argument.getFullYear(), 0, 1);
            var diff = argument - base;
            converted = paddingLeft(Math.round(diff / (24*60*60*1000)) + 1, '0', 3); // 001 to 366
            break;
          case 'm':
            converted = paddingLeft(argument.getMonth() + 1, '0', 2);
            break;
          case 'd':
            converted = paddingLeft(argument.getDate(), '0', 2);
            break;
          case 'e':
            converted = argument.getDate();
            break;
          case 'R':
            var hour = paddingLeft(argument.getHours(), '0', 2);
            var min = paddingLeft(argument.getMinutes(), '0', 2);
            converted = hour + ':' + min;
            break;
          case 'T':
            var hour = paddingLeft(argument.getHours(), '0', 2);
            var min = paddingLeft(argument.getMinutes(), '0', 2);
            var sec = paddingLeft(argument.getSeconds(), '0', 2);
            converted = hour + ':' + min + ':' + sec;
            break;
          case 'r':
            var hour = paddingLeft(argument.getHours(), '0', 2);
            var min = paddingLeft(argument.getMinutes(), '0', 2);
            var sec = paddingLeft(argument.getSeconds(), '0', 2);
            var meridiem = argument.getHours();
            meridiem = (argument.getHours() == 24 || argument.getHours() < 13) ? 'am' : 'pm';
            meridiem = meridiem.toUpperCase();
            converted = hour + ':' + min + ':' + sec + ' ' + meridiem;
            break;
          case 'D':
            var year = paddingLeft(argument.getYear(), '0', 2);
            var month = paddingLeft(argument.getMonth() + 1, '0', 2);
            var day = paddingLeft(argument.getDate(), '0', 2);
            converted = month + '/' + day + '/' + year;
            break;
          case 'F':
            var year = argument.getFullYear();
            var month = paddingLeft(argument.getMonth() + 1, '0', 2);
            var day = paddingLeft(argument.getDate(), '0', 2);
            converted = year + '-' + month + '-' + day;
            break;
          case 'c':
            // javascript hasn't timezone info
            throw new Error('unsupported time format: c');
          default:
            throw new Error('unknown time format: ' + conversion);
        }

        return this.format(converted, flags, width);
    };

    DateAndTimeConverter.prototype.format = function(str, flags, width) {
        if (flags.alternateForm) {
            throw new Error('format flags conversion mismatch: alternative form is not supported in date and time conversion.');
        }

        if (width && str.length < width) {
            if (flags.leftAlign) {
                str = paddingRight(str, ' ', width);
            } else {
                str = paddingLeft(str, ' ', width);
            }
        }

        if (this.isUpperCase) {
            str = str.toUpperCase();
        }

        return str;
    };


    /*
     * class BooleanConverter
     */
    var BooleanConverter = function(isUpperCase) {
        this.isUpperCase = isUpperCase;
    };

    BooleanConverter.prototype.convert = function(argument, precision, flags, width) {
        var str = '';

        if (argument == null) {
            str = 'false';
        } else if (typeof argument == 'boolean') {
            str = (argument) ? 'true' : 'false';
        } else {
            str = 'true';
        }

        return this.format(str, flags, width);
    };

    BooleanConverter.prototype.format = function(str, flags, width) {
        if (flags.alternateForm) {
            throw new Error('format flags conversion mismatch: alternative form is not supported in boolean conversion.');
        }

        if (width && str.length < width) {
            if (flags.leftAlign) {
                str = paddingRight(str, ' ', width);
            } else {
                str = paddingLeft(str, ' ', width);
            }
        }

        if (this.isUpperCase) {
            str = str.toUpperCase();
        }

        return str;
    };


    /*
     * class JSONConverter
     */
    var JSONConverter = function() {
    };

    JSONConverter.prototype.convert = function(argument, precision, flags, width) {
        var str = JSON.stringify(argument);

        if (width && str.length < width) {
            if (flags.leftAlign) {
                str = paddingRight(str, ' ', width);
            } else {
                str = paddingLeft(str, ' ', width);
            }
        }

        return str;
    };


    /*
     * class AbstractCharacterConverter
     */
    var AbstractCharacterConverter = function(isUpperCase) {
        this.isUpperCase = isUpperCase;
    };

    AbstractCharacterConverter.prototype.format = function(str, flags, width) {
        if (flags.alternateForm) {
            throw new Error('format flags conversion mismatch: alternative form is not supported in character conversion.');
        }

        if (width && str.length < width) {
            if (flags.leftAlign) {
                str = paddingRight(str, ' ', width);
            } else {
                str = paddingLeft(str, ' ', width);
            }
        }

        if (this.isUpperCase) {
            str = str.toUpperCase();
        }

        return str;
    };


    /*
     * class StringConverter
     */
    var StringConverter = function(isUpperCase) {
        AbstractCharacterConverter.call(this, isUpperCase);
    };

    StringConverter.prototype = new AbstractCharacterConverter();

    StringConverter.prototype.convert = function(argument, precision, flags, width) {
        var str = argument.toString();

        return this.format(str, flags, width);
    };


    /*
     * class CharacterConverter
     */
    var CharacterConverter = function(isUpperCase) {
        AbstractCharacterConverter.call(this, isUpperCase);
    };

    CharacterConverter.prototype = new AbstractCharacterConverter();

    CharacterConverter.prototype.convert = function(argument, precision, flags, width) {
        var str = argument.toString();
        if (str.length != 1) {
            throw new Error('string length != 1');
        }

        return this.format(str, flags, width);
    };


    /*
     * class IntegerConverter
     */
    var IntegerConverter = function(isUpperCase) {
        this.isUpperCase = isUpperCase;
    };

    IntegerConverter.prototype.format = function(num, str, flags, width) {
        if (flags.groupingSeparator) {
            str = this.formatGroupingSeparator(str);
        }
        if (flags.alternateForm) {
            str = this.formatAlternateForm(str);
        }
        if (flags.signPlus) {
            str = this.formatSignPlus(str, num);
        }
        if (flags.signSpace) {
            str = this.formatSignSpace(str, num);
        }
        if (flags.surroundNegative) {
            str = this.formatSurroundNegative(str, num);
        }

        if (width && str.length < width) {
            str = this.formatPadding(str, flags, width);
        }

        if (this.isUpperCase) {
            str = str.toUpperCase();
        }

        return str;
    };

    IntegerConverter.prototype.formatPadding = function(str, flags, width) {
        if (flags.leftAlign) {
            str = paddingRight(str, ' ', width);
        } else {
            var pad = (flags.zeroPadding) ? '0' : ' ';
            str = paddingLeft(str, pad, width);
        }
        return str;
    };

    IntegerConverter.prototype.formatSignPlus = function(str, num) {
        throw new Error('format flags conversion mismatch: sign plus is not supported in integer conversion.');
    };

    IntegerConverter.prototype.formatSignSpace = function(str, num) {
        throw new Error('format flags conversion mismatch: sign space is not supported in integer conversion.');
    };

    IntegerConverter.prototype.formatGroupingSeparator = function(str) {
        throw new Error('format flags conversion mismatch: grouping separator is not supported in integer conversion.');
    };

    IntegerConverter.prototype.formatSurroundNegative = function(str, num) {
        throw new Error('format flags conversion mismatch: surround negative is not supported in integer conversion.');
    };

    IntegerConverter.prototype.formatAlternateForm = function(str) {
        throw new Error('format flags conversion mismatch: alternate form is not supported in integer conversion.');
    };


    /*
     * class DecimalConverter
     */
    var DecimalConverter = function() {
        IntegerConverter.call(this, false);
    };

    DecimalConverter.prototype = new IntegerConverter();

    DecimalConverter.prototype.convert = function(argument, precision, flags, width) {
        var num = Math.floor(argument);
        var str = num.toString();

        str = this.format(num, str, flags, width);

        return str;
    };

    DecimalConverter.prototype.formatSignPlus = function(str, num) {
        if (num > 0) {
            return '+' + str;
        } else {
            return str;
        }
    };

    DecimalConverter.prototype.formatSignSpace = function(str, num) {
        if (num > 0) {
            return ' ' + str;
        } else {
            return str;
        }
    };

    DecimalConverter.prototype.formatGroupingSeparator = function(str) {
        var sign = (str.indexOf('-') === 0) ? 1 : 0;
        var s = insertThousandsSeparator(str.slice(sign), ',');
        return (sign === 0) ? s : '-' + s;
    };

    DecimalConverter.prototype.formatSurroundNegative = function(str, num) {
        if (num < 0) {
            return '(' + str.substring(1, str.length) + ')';
        } else {
            return str;
        }
    };


    /*
     * class OctalConverter
     */
    var OctalConverter = function(isUpperCase) {
        IntegerConverter.call(this, isUpperCase);
    };

    OctalConverter.prototype = new IntegerConverter();

    OctalConverter.prototype.convert = function(argument, precision, flags, width) {
        var num = Math.floor(argument);
        var str = num.toString(8);

        return this.format(num, str, flags, width);
    };

    OctalConverter.prototype.formatAlternateForm = function(str) {
        return '0' + str;
    };


    /*
     * class HexadecimalConverter
     */
    var HexadecimalConverter = function(isUpperCase) {
        IntegerConverter.call(this, isUpperCase);
    };

    HexadecimalConverter.prototype = new IntegerConverter();

    HexadecimalConverter.prototype.convert = function(argument, precision, flags, width) {
        var num = (argument >>> 0);
        var str = num.toString(16);

        return this.format(num, str, flags, width);
    };

    HexadecimalConverter.prototype.formatAlternateForm= function(str) {
        return '0x' + str;
    };


    /*
     * class AbstractFloatConverter
     */
    var AbstractFloatConverter = function(isUpperCase) {
        this.isUpperCase = isUpperCase;
    };

    AbstractFloatConverter.prototype.format = function(num, str, flags, width) {
        if (flags.groupingSeparator) {
            str = this.formatGroupingSeparator(str);
        }
        if (flags.alternateForm) {
            str = this.formatAlternateForm(str);
        }
        if (flags.signPlus) {
            str = this.formatSignPlus(str, num);
        }
        if (flags.signSpace) {
            str = this.formatSignSpace(str, num);
        }
        if (flags.surroundNegative) {
            str = this.formatSurroundNegative(str, num);
        }

        if (width && str.length < width) {
            str = this.formatPadding(str, flags, width);
        }

        if (this.isUpperCase) {
            str = str.toUpperCase();
        }

        return str;
    };

    AbstractFloatConverter.prototype.formatPadding = function(str, flags, width) {
        if (flags.leftAlign) {
            str = paddingRight(str, ' ', width);
        } else {
            var pad = (flags.zeroPadding) ? '0' : ' ';
            str = paddingLeft(str, pad, width);
        }
        return str;
    };

    AbstractFloatConverter.prototype.formatAlternateForm = function(str) {
        if (str.indexOf('.') == -1) {
            return str + '.';
        } else {
            return str;
        }
    };

    AbstractFloatConverter.prototype.formatSignPlus = function(str, num) {
        if (num > 0) {
            return '+' + str;
        } else {
            return str;
        }
    };

    AbstractFloatConverter.prototype.formatSignSpace = function(str, num) {
        if (num >= 0) {
            return ' ' + str;
        } else {
            return str;
        }
    };

    AbstractFloatConverter.prototype.formatGroupingSeparator = function(str) {
        var pair = str.split('.');

        var integerPart = pair[0];
        var sign = (integerPart.indexOf('-') === 0) ? 1 : 0;
        var s = insertThousandsSeparator(integerPart.slice(sign), ',');
        s =  (sign === 0) ? s : '-' + s;

        if (pair.length == 2) {
            return s + '.' + pair[1];
        } else {
            return s;
        }
    };

    AbstractFloatConverter.prototype.formatSurroundNegative = function(str, num) {
        if (num < 0) {
            return '(' + str.substring(1, str.length) + ')';
        } else {
            return str;
        }
    };

    AbstractFloatConverter.prototype.normalize = function(num, precision) {
        var exp = {};

        var vals = num.toExponential(precision - 1).split(/e/);
        exp.real = vals[0];
        exp.sign = vals[1].charAt(0);
        exp.base = vals[1].substring(1, vals[1].length);

        return exp;
    };


    /*
     * class ExponentialConverter
     */
    var ExponentialConverter = function(isUpperCase) {
        AbstractFloatConverter.call(this, isUpperCase);
    };

    ExponentialConverter.prototype = new AbstractFloatConverter;

    ExponentialConverter.prototype.convert = function(argument, precision, flags, width) {
        if (precision == -1) {
            precision = 6;
        }

        var num = parseFloat(argument);
        var exp = this.normalize(num, precision + 1);
        var str = this.toExponential(exp, precision);

        return this.format(num, str, flags, width);
    };

    ExponentialConverter.prototype.formatGroupingSeparator = function(str, num) {
        throw new Error('format flags conversion mismatch: grouping separator is not supported in exponential conversion.');
    };

    ExponentialConverter.prototype.toExponential = function(exp, precision) {
        return exp.real + 'e' + exp.sign + paddingLeft(exp.base, '0', 2);
    };


    /*
     * class FloatConverter
     */
    var FloatConverter = function() {
        AbstractFloatConverter.call(this, false);
    };

    FloatConverter.prototype = new AbstractFloatConverter;

    FloatConverter.prototype.convert = function(argument, precision, flags, width) {
        if (precision == -1) {
            precision = 6;
        }

        var num = parseFloat(argument);
        var converted = this.toFloat(num, precision);

        return this.format(num, converted, flags, width);
    };

    FloatConverter.prototype.toFloat = function(num, precision) {
        var roundedNumber = Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);

        var str = roundedNumber.toString();
        var point = str.indexOf('.');

        var integerPart = (point != -1) ? str.substring(0, point) : str;
        var floatingPart = (point != -1) ? str.substring(point+1, str.length) : '';

        var len = floatingPart.length;
        if (len < precision) {
            floatingPart = paddingRight(floatingPart, '0', precision);
        }

        var result = '';
        if (floatingPart.length > 0) {
            result = integerPart + '.' + floatingPart;
        } else {
            result = integerPart;
        }

        return result;
    };


    /*
     * class ComputerizedConverter
     */
    var ComputerizedConverter = function() {
        AbstractFloatConverter.call(this, false);
    };

    ComputerizedConverter.prototype = new AbstractFloatConverter;

    ComputerizedConverter.prototype.convert = function(argument, precision, flags, width) {
        if (precision == -1) {
            precision = 6;
        } else if (precision == 0) {
            precision = 1;
        }

        var exp = this.normalize(parseFloat(argument), precision);
        var num = this.exponentialToFloatValue(exp);
        if (Math.abs(num) < Math.pow(10, -4) ||
            Math.abs(num) >= Math.pow(10, precision)) {
            converted = this.toExponential(exp, precision);
        } else {
            converted = this.toFloat(num, precision);
        }

        return this.format(num, converted, flags, width);
    };

    ComputerizedConverter.prototype.formatAlternateForm = function(str) {
        throw new Error('format flags conversion mismatch: alternative form is not supported in computerized conversion.');
    };

    ComputerizedConverter.prototype.toExponential = function(exp, precision) {
        return exp.real + 'e' + exp.sign + paddingLeft(exp.base, '0', 2);
    };

    ComputerizedConverter.prototype.toFloat = function(num, precision) {
        return num.toPrecision(precision);
    };

    ComputerizedConverter.prototype.exponentialToFloatValue = function(exp, precision) {
        return exp.real * Math.pow(10, parseInt(exp.sign + exp.base));
    }


    /*
     * class HexadecimalFloatConverter
     */
    var HexadecimalFloatConverter = function(isUpperCase) {
        AbstractFloatConverter.call(this, isUpperCase);
    };

    HexadecimalFloatConverter.prototype = new AbstractFloatConverter;

    HexadecimalFloatConverter.prototype.convert = function(argument, precision, flags, width) {
        var num = parseFloat(argument);
        if (isNaN(argument)) {
            return 'NaN';
        }
        var that = +argument;
        if (that == 0.0) {
//        if (Object.is(that, +0.0)) {
            return '0x0p+0';
//        } else if (Object.is(that, -0.0)) {
//            return '-0x0p+0';
        } else if (!isFinite(that)) {
            return (that < 0 ? '-' : '') + 'Infinity';
        }
        var sign = that < 0 ? '-' : '';
        var a = Math.abs(that);
        var p = 0;
        if (a < 1) {
            while (a < 1)  { a *= 2; p-- }
        } else {
            while (a >= 2) { a *= 0.5; p++ }
        }
        var converted = sign + '0x' + (precision < 0 ? a.toString(16) : precision == 0 ? '1' : a.toString(16).substring(0, 2 + precision)) + 'p' + p.toString(10);
        return this.format(num, converted, flags, width);
    };

    HexadecimalFloatConverter.prototype.formatPadding = function(str, flags, width) {
        if (flags.zeroPadding) {
            var temp = str.substring(2, str.length);
            temp = AbstractFloatConverter.prototype.formatPadding.call(
                this, temp, flags, width - 2);
            return '0x' + temp;
        } else {
            return AbstractFloatConverter.prototype.formatPadding.call(this, str, flags, width);
        }
    };

    HexadecimalFloatConverter.prototype.formatGroupingSeparator = function(str) {
        throw new Error('format flags conversion mismatch: grouping separator is not supported in hexadecimal float conversion.');
    };

    HexadecimalFloatConverter.prototype.formatSurroundNegative = function(str) {
        throw new Error('format flags conversion mismatch: surround negative is not supported in hexadecimal float conversion.');
    };


    /*
     * class NoArgumentConverter
     */
    var NoArgumentConverter = function() {
    };


    /*
     * class LiteralConverter
     */
    var LiteralConverter = function() {
    };

    LiteralConverter.prototype = new NoArgumentConverter();

    LiteralConverter.prototype.convert = function(precision, flags, width) {
        return this.format('%', flags, width);
    };

    LiteralConverter.prototype.format = function(str, flags, width) {
        return str;
    };


    /*
     * class LineSeparatorConverter
     */
    var LineSeparatorConverter = function() {
    };

    LineSeparatorConverter.prototype = new NoArgumentConverter();

    LineSeparatorConverter.prototype.convert = function(precision, flags, width) {
        return this.format('\n', flags, width);
    };

    LineSeparatorConverter.prototype.format = function(str, flags, width) {
        if (width >= 0) {
            throw new Error('illegal format width: ' + width);
        }

        return str;
    };


    /*
     * converters
     */
    var genericConverters = {
        'b': new BooleanConverter(false),
        'B': new BooleanConverter(true),
        'j': new JSONConverter(true),
        's': new StringConverter(false),
        'S': new StringConverter(true),
        'c': new CharacterConverter(false),
        'C': new CharacterConverter(true),
        'd': new DecimalConverter(),
        'o': new OctalConverter(false),
        'O': new OctalConverter(true),
        'x': new HexadecimalConverter(false),
        'X': new HexadecimalConverter(true),
        'e': new ExponentialConverter(false),
        'E': new ExponentialConverter(true),
        'f': new FloatConverter(),
        'g': new ComputerizedConverter(false),
        'G': new ComputerizedConverter(true),
        'a': new HexadecimalFloatConverter(false),
        'A': new HexadecimalFloatConverter(true)
    };

    var literalConverters = {
        '%': new LiteralConverter(),
        'n': new LineSeparatorConverter()
    };

    var dateAndTimeConverters = {
        't': new DateAndTimeConverter(false),
        'T': new DateAndTimeConverter(true)
    };


    /*
     * class Formatter
     */
    var Formatter = function() {
    };

    Formatter.prototype.doFormat = function(fmt, args) {
        var exp = /%(([1-9][0-9]*)\$|\<)?([-#+ 0,(]+)?(\d+)?(\.\d+)?([^tT]|[tT][a-zA-Z])/g;

        this.args = args;
        this.count = 0;
        this.previous = -1;

        var self = this;
        return fmt.replace(exp, function(whole, g1, g2, g3, g4, g5, g6) {
            return self.replace(whole, g1, g2, g3, g4, g5, g6);
        });
    };

    Formatter.prototype.replace = function(whole, g1, g2, g3, g4, g5, g6) {
        var index = this.count;
        if (g1 && g1 == '<') {
            index = this.previous;
        } else if (g2 && g2.length != 0) {
            index = g2 - 1;
        } else if (g6 != '%' && g6 != '\n'){
            this.count++;
        }
        this.previous = index;

        var flags = (g3 && g3.length != 0) ? this.parseFlags(g3) : {};
        var width = (g4 && g4.length != 0) ? g4 : -1;
        var precision = (g5 && g5.length != 0) ? parseInt(g5.substring(1, g5.length)) : -1;
        var conversion = g6;

        var replaced = '';
        if (conversion == '%' || conversion == 'n') {
            var converter = literalConverters[conversion];
            replaced = converter.convert(precision, flags, width);
        } else {
            if (index >= this.args.length || index < 0) {
                throw new Error("missing argument '$" + index + "'");
            }
            var argument = this.args[index];

            if (conversion.match(/^[Tt]/)){
                var converter = dateAndTimeConverters[conversion.charAt(0)];
                replaced = converter.convert(argument, flags, width, conversion);
            } else {
                var converter = genericConverters[conversion.charAt(0)];
                if (converter === undefined) {
                    throw new Error("unknown conversion '" + conversion.charAt(0) + "'");
                }
                replaced = converter.convert(argument, precision, flags, width, conversion);
            }
        }
        return replaced;
    };

    Formatter.prototype.hasDuplication = function(a) {
        for(var i = 0; i < a.length-1; i++) {
            for(var j = i+1; j < a.length; j++) {
                if (a.charAt(i) == a.charAt(j)) {
                    return true;
                }
            }
        }
        return false;
    };

    Formatter.prototype.parseFlags = function(str) {
        var flags = {};
        flags.leftAlign = false;
        flags.signPlus = false;
        flags.signSpace = false;
        flags.zeroPadding = false;
        flags.surroundNegative = false;
        flags.alternateForm = false;
        flags.groupingSeparator = false;

        // duplication check
        if (this.hasDuplication(str)) {
            throw new Error('has duplication in flags: ' + str);
        }

        for(var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            switch(c) {
              case '-':
                flags.leftAlign = true;
                break;
              case '#':
                flags.alternateForm = true;
                break;
              case '+':
                flags.signPlus = true;
                break;
              case ' ':
                flags.signSpace = true;
                break;
              case '0':
                flags.zeroPadding = true;
                break;
              case ',':
                flags.groupingSeparator = true;
                break;
              case '(':
                flags.surroundNegative = true;
                break;
              default:
                throw new Error("unknown format flag: '" + c + "'");
            }
        }

        if (flags.signPlus && flags.signSpace) {
            throw new Error("illegal format flags: '+' & ' '");
        }

        if (flags.leftAlign && flags.zeroPadding) {
            throw new Error("illegal format flags: '-' & '0'");
        }

        return flags;
    };

})();
