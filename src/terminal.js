var Reset = "\x1b[0m",
Bright = "\x1b[1m",
Dim = "\x1b[2m",
Underscore = "\x1b[4m",
Blink = "\x1b[5m",
Reverse = "\x1b[7m",
Hidden = "\x1b[8m",

BgBlack = "\x1b[40m",
BgRed = "\x1b[41m",
BgGreen = "\x1b[42m",
BgYellow = "\x1b[43m",
BgBlue = "\x1b[44m",
BgMagenta = "\x1b[45m",
BgCyan = "\x1b[46m",
BgWhite = "\x1b[47m",
BgGray = "\x1b[100m"
var QRCode = require('./QRCode'),
    QRErrorCorrectLevel = require('./QRCode/QRErrorCorrectLevel'),
    black = BgBlack +"  "+ Reset,
    white = BgMagenta +"  "+ Reset,
    toCell = function (isBlack) {
        return isBlack ? black : white;
    },
    repeat = function (color) {
        return {
            times: function (count) {
                return new Array(count).join(color);
            }
        };
    },
    fill = function(length, value) {
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            arr[i] = value;
        }
        return arr;
    };

module.exports = {

    error: QRErrorCorrectLevel.L,

    generate: function (input, opts, cb) {
        if (typeof opts === 'function') {
            cb = opts;
            opts = {};
        }

        var qrcode = new QRCode(-1, this.error);
        qrcode.addData(input);
        qrcode.make();

        var output = '';
        if (opts && opts.small) {
            var BLACK = true, WHITE = false;
            var moduleCount = qrcode.getModuleCount();
            var moduleData = qrcode.modules.slice();

            var oddRow = moduleCount % 2 === 1;
            if (oddRow) {
                moduleData.push(fill(moduleCount, WHITE));
            }

            var platte= {
                WHITE_ALL: '\u2588',
                WHITE_BLACK: '\u2580',
                BLACK_WHITE: '\u2584',
                BLACK_ALL: ' ',
            };

            var borderTop = repeat(platte.BLACK_WHITE).times(moduleCount + 3);
            var borderBottom = repeat(platte.WHITE_BLACK).times(moduleCount + 3);
            output += borderTop + '\n';

            for (var row = 0; row < moduleCount; row += 2) {
                output += platte.WHITE_ALL;

                for (var col = 0; col < moduleCount; col++) {
                    if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === WHITE) {
                        output += platte.WHITE_ALL;
                    } else if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === BLACK) {
                        output += platte.WHITE_BLACK;
                    } else if (moduleData[row][col] === BLACK && moduleData[row + 1][col] === WHITE) {
                        output += platte.BLACK_WHITE;
                    } else {
                        output += platte.BLACK_ALL;
                    }
                }

                output += platte.WHITE_ALL + '\n';
            }

            if (!oddRow) {
                output += borderBottom;
            }
        } else {
            var border = repeat(white).times(qrcode.getModuleCount() + 3);

            output += border + '\n';
            qrcode.modules.forEach(function (row) {
                output += white;
                output += row.map(toCell).join(''); 
                output += white + '\n';
            });
            output += border;
        }

        if (cb) cb(output);
        else console.log(output);
    },

    setErrorLevel: function (error) {
        this.error = QRErrorCorrectLevel[error] || this.error;
    }

};
