var yargs = require('yargs');
var qr = require('../lib');
const Utils = require('../lib/renderer/utils');

/**
 *
 * @function
 * @name constructUri
 * @desc Constructs an Algorand URI from given Algorand spec options
 * @param {*} options
 * @return {String}
 */
function constructUri (options){
  let {wallet, xnote, note, label, amount, asset, html} = options;
  let alrorandURI = '';
  if(asset){
    if(asset.length===0)asset = null;

  }
  if(amount){
    if(!(Number(amount)>0)){
      amount = null;
    }else{
      amount = Number(!asset ? amount * 1000000 : amount);
    }
    
  }
  if(label){
    if(label.length === 0){
      label = null;
    }
    
  }
  if(!note){
    note = ''
  }
  if(!xnote){
    xnote = false
  }
//alrorandURI = `algorand://${wallet}?${label ? 'label='+label : ''}${amount ? '&amount='+amount : ''}${asset ? '&asset='+asset : ''}${xnote ? '&xnote='+note : '&note='+note}`
  
  if(!amount && label){
    alrorandURI = `algorand://${wallet}?label=${label}`
    
    
  }else if(!label && asset && amount){
    alrorandURI = `algorand://${wallet}?amount=${amount}&asset=${asset}${xnote ? '&xnote='+note : '&note='+note}`
    
  }else if(label && !asset && amount){
    alrorandURI = `algorand://${wallet}?amount=${amount}&label=${label}${xnote ? '&xnote='+note : '&note='+note}`
   
  }else if(label && asset && amount){
    alrorandURI = `algorand://${wallet}?amount=${amount}&asset=${asset}&label=${label}${xnote ? '&xnote='+note : '&note='+note}`
   
  }

  if(html){alrorandURI = Utils.escapeHtml(alrorandURI)};
  alrorandURI = Utils.encodeUrl(alrorandURI);
  console.log('Generated Algorand URI: ', alrorandURI)
  return alrorandURI;
}
/**
 *
 * @function
 * @name save
 * @desc Saves an generated Algorand QR Code into image file
 * @param {Blob} file
 * @param {*} options
 * @return {*}
 */
function save (file, options) {
  return qr.toFile(file, options, function (err, data) {
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
function print (options) {
  options.type = 'terminal'
  return qr.toString(options, function (err, resqr) {
    if (err) {
      console.error('Error:', err.message)
      process.exit(1)
    }else{
      console.log(resqr);
    }
  })
}

/**
 *
 * @function
 * @name parseOptions
 * @desc Parses and fetches Algorand options from args
 * @param {Array} args
 * @return {*}
 */
function parseOptions (args) {
  return {
    xnote: args.xnote,
    wallet: args.dest,
    amount: args.amount,
    label: args.label,
    asset: args.asset,
    note: args.note,
    html: args.html,
    version: args.qversion,
    errorCorrectionLevel: args.error,
    type: args.type,
    small: !!args.puny,
    inverse: !!args.inverse,
    maskPattern: args.mask,
    margin: args.qzone,
    width: args.width,
    scale: args.ratio,
    color: {
      light: args.background,
      dark: args.foreground
    }
  }
}

/**
 *
 * @function
 * @name processInputs
 * @desc Process CLI inputs
 * @param {Array} opts
 * @return {*}
 */
function processInputs (opts) {
  if (!opts) {
    yargs.showHelp()
    process.exit(1)
  }

  if (opts.output) {
    return save(opts.output, parseOptions(opts))
  } else {
    return print(parseOptions(opts))
  }
}

// Instantiation of yargs with configuration to get CLI interaction up and running
var argv = yargs
  .detectLocale(false)
  .usage('Usage: $0 [options]')
  .option('x', {
    alias: 'xnote',
    description: 'Algorand URI xnote field',
    group: 'Algorand URI params:',
    type: 'boolean'
  })
  .option('d', {
    alias: 'dest',
    description: 'Algorand URI destination wallet (account) address field',
    group: 'Algorand URI params:',
    type: 'string'
  })
  .option('a', {
    alias: 'amount',
    description: 'Algorand URI amount field',
    group: 'Algorand URI params:',
    type: 'number'
  })
  .option('l', {
    alias: 'label',
    description: 'Algorand URI label field',
    group: 'Algorand URI params:',
    type: 'string'
  })
  .option('s', {
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
  .option('v', {
    alias: 'qversion',
    description: 'QR Code symbol version (1 - 40)',
    group: 'QR Code options:',
    type: 'number'
  })
  .option('e', {
    alias: 'error',
    description: 'Error correction level',
    choices: ['L', 'M', 'Q', 'H'],
    group: 'QR Code options:'
  })
  .option('m', {
    alias: 'mask',
    description: 'Mask pattern (0 - 7)',
    group: 'QR Code options:',
    type: 'number'
  })
  .option('t', {
    alias: 'type',
    description: 'Output type',
    choices: ['png', 'svg', 'utf8'],
    implies: 'output',
    group: 'Renderer options:'
  })
  .option('i', {
    alias: 'inverse',
    type: 'boolean',
    description: 'Invert colors',
    group: 'Renderer options:'
  })
  .option('w', {
    alias: 'width',
    description: 'Image width (px)',
    conflicts: 'scale',
    group: 'Renderer options:',
    type: 'number'
  })
  .option('r', {
    alias: 'ratio',
    description: 'Scale ratio factor',
    conflicts: 'width',
    group: 'Renderer options:',
    type: 'number'
  })
  .option('q', {
    alias: 'qzone',
    description: 'Quiet zone size',
    group: 'Renderer options:',
    type: 'number'
  })
  .option('b', {
    alias: 'background',
    description: 'background RGBA hex color',
    group: 'Renderer options:'
  })
  .option('f', {
    alias: 'foreground',
    description: 'Foreground RGBA hex color',
    group: 'Renderer options:'
  })
  .option('p', {
    alias: 'puny',
    type: 'boolean',
    description: 'Output smaller QR code to terminal',
    conflicts: 'type',
    group: 'Renderer options:'
  })
  .option('y',{
    alias: 'html',
    type: 'boolean',
    description: 'Escape HTML on demand',
    group: 'Renderer options:'
  })
  .option('o', {
    alias: 'output',
    description: 'Output file'
  })
  .help('h')
  .alias('h', 'help')
  .version()
  .example('$0 -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -a 1000000 -n "This is a test transaction for QR code generator"', 'Draw Algorand Payment QR in terminal window')
  .example('$0 -o algorandQR.png -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -l "Coffee"', 'Save Algorand contact label as png image')
  .example('$0 -f F00 -o algorandQR.png -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -a 1000000 -s 45 -n "This is a test USDT transfer for QR code generator"', 'Use red as foreground color')
  .parserConfiguration({'parse-numbers': false})
  .argv
// Process of QR Code via command line interface has been started start
processInputs(argv)

