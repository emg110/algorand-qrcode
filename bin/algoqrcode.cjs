#!/usr/bin/env node
const QRCode = require("qrcode-svg")
const QRCodeTerminal = require("../src/terminal.cjs")
const yargs = require('yargs');


/**
 *
 * @function
 * @name save
 * @desc Saves an generated Algorand QR Code into image file
 * @param {Blob} file
 * @param {*} options
 * @return {*}
 */
function save(file, options) {
    return new QRCode(options).save(file, function (err, data) {
        if (err) {
            console.error('Error:', err.message)
            process.exit(1)
        }

        console.log('saved qrcode to: ' + file + '\n')
    })
}

/**
 *
 * @function
 * @name print
 * @desc prints an generated Algorand QR Code into console log
 * @param {Blob} file
 * @param {*} options
 * @return {*}
 */
function handle(options) {

     if (options.output === 'file') {

        return new QRCode(options).save(options.file, function (error) {
            if (error) throw error;
            console.log("Done!");
        })
    }else if (options.output === 'svg') {

        return console.log(new QRCode(options).svg())
    } else {
        return QRCodeTerminal.generate(options.content, {small: true})
    }

}

/**
 *
 * @function
 * @name parseOptions
 * @desc Parses and fetches Algorand options from args
 * @param {Array} args
 * @return {*}
 */
function parseOptions(args) {
    /* 
  content: "http://github.com/",
  padding: 4,
  width: 256,
  height: 256,
  color: "#000000",
  background: "#ffffff",
  ecl: "M",
*/
    let content = "algorand://"
    let amount = args.amount;
    let wallet = args.wallet;
    let label = args.label;
    let asset = args.asset;
    let note = args.note;
    if (!!label && !!wallet) {
        content = "algorand://" + wallet+ "?" + "&label=" + label;
    } else if (!!asset && !!wallet) {
        if (!!note && amount > 0) {
            content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&asset=" + asset + "&note=" + note;
        } else if (amount > 0) {
            content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&asset=" + asset;
        } else if (amount === 0) {
            content = "algorand://?" + "amount=0"  + "&asset=" + asset;
        }

    } else if (!!note && !!wallet && !!amount) {
        content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&note=" + note;
    } else if ( !!wallet && !!amount){
        content = "algorand://" + wallet+ "?" + "&amount=" + amount;
    }
    let options = {
        content: content,
        container: "svg-viewbox",
        ecl: args.ecl || "H",
        file: args.file || "algorand-qrcode.svg",
        padding: args.margin || 4,
        width: args.width || 256,
        height: args.height || 256,
        output: args.output || "terminal",
        background: args.background || "#e1dede",
        color: args.color || "#000000"
    }
    return options
}

/**
 *
 * @function
 * @name processInputs
 * @desc Process CLI inputs
 * @param {Array} opts
 * @return {*}
 */
function processInputs(opts) {
    
    if (!opts) {
        yargs.showHelp()
        process.exit(1)
    }

    return handle(parseOptions(opts))
}

// Instantiation of yargs with configuration to get CLI interaction up and running
console.log(`
    _______         ______  _____   _____   ______ _______  _____  ______  _______
    |_____| |      |  ____ |     | |   __| |_____/ |       |     | |     \ |______
    |     | |_____ |_____| |_____| |____\| |    \_ |_____  |_____| |_____/ |______
                                                                                  
    `)
var argv = yargs
    .detectLocale(false)
    .usage('Usage: $0 [options]')
    .option('m', {
        alias: 'amount',
        description: 'Algorand URI amount field',
        group: 'Algorand URI params:',
        type: 'number'
    })
    .option('w', {
        alias: 'wallet',
        description: 'Algorand URI destination wallet (account) address field',
        group: 'Algorand URI params:',
        type: 'string'
    })
    .option('l', {
        alias: 'label',
        description: 'Algorand URI label field',
        group: 'Algorand URI params:',
        type: 'string'
    })
    .option('a', {
        alias: 'asset',
        description: 'Algorand URI asset id field',
        group: 'Algorand URI params:',
        type: 'number'
    })
    .option('n', {
        alias: 'note',
        description: 'Algorand URI note field',
        group: 'Algorand URI params:',
        type: 'string'
    })
    .option('e', {
        alias: 'ecl',
        description: 'Error correction level',
        choices: ['L', 'M', 'Q', 'H'],
        group: 'QR Code options:'
    })
    .option('s', {
        alias: 'size',
        description: 'Image width and height (px)',
        group: 'Renderer options:',
        type: 'number'
    })
    .option('p', {
        alias: 'padding',
        description: 'QR Free padding size (px)',
        group: 'Renderer options:',
        type: 'number'
    })
    .option('b', {
        alias: 'background',
        description: 'background color',
        group: 'Renderer options:'
    })
    .option('c', {
        alias: 'color',
        description: 'Foreground color',
        group: 'Renderer options:'
    })
    .option('f', {
        alias: 'file',
        description: 'File name to save QR code SVG image',
        group: 'Renderer options:'
    })
    .option('o', {
        alias: 'output',
        description: `Output type: "terminal", "file" or "svg" string`,
    })
    .help('h')
    .alias('h', 'help')
    .version()
    .example('$0 -w "AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI" -a 1000000 -n "This is a test transaction for QR code generator"')
    .example('$0 -o file -f algorand-qrcode.svg -w "AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI" -l "Coffee Payment at StarBucks"')
    .example('$0 -o file -f algorand-qrcode.svg -w "AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI" -a 1000000 -n "This is a test USDT transfer for QR code generator file save"')
    .parserConfiguration({ 'parse-numbers': false })
    .argv
// Process of QR Code via command line interface has been started start

processInputs(argv)
