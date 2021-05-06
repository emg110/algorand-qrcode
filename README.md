[<img title="Algorand Payment Prompts" src="./examples/images/algorand-payment-qr-banner.png">](#algorand-payment-qr-generator)

# Algorand Payment QR Generator
[![npm](https://img.shields.io/static/v1?label=Algorand&message=Draft&color=yellow&style=flat-square)](https://developer.algorand.org/solutions/algorand-payment-qr-generator/)
[![npm](https://img.shields.io/static/v1?label=npm&message=OK&color=green&style=flat-square)](https://www.npmjs.com/package/algorand-payment-qr)
[![npm](https://img.shields.io/npm/l/qrcode.svg?style=flat-square)](https://github.com/emg110/algorand-payment-qr/blob/master/license)

A comprehensive javascript module with a complete set of tools to generates an standard Algorand URI (RFC 3986) and  QR code/2d barcode ,exportable to SVG, PNG and UTF8. Exported media types are File, UTF8 text and DataURL. Works in Terminal, Node and modern browsers. Contains full set of examples including API server, static server and web form QR generator. Includes a full featured CLI to generate QR codes in terminals too.
<div style="display:block;text-align:center;">
<img style="display:block;margin:auto;cursor:pointer" title="Generated QR example" src="./examples/images/generated-qr.png" height="auto" width="150">

<p style="display:block;background-color:#4fcdf0;font-size:0.7em">algorand://LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q?label=emg110@gmail.com</p>
</div>


## Technical notes
- Algorand URI reference specificatgion: [Algorand payment prompts specification](https://developer.algorand.org/docs/reference/payment_prompts/).
- Requires NodeJS version >= 10
- Since all the texts for Algorand URI fields is HTML Escaped and RFC 3986 encoded, for 

## Table of contents

- [Screenshots](#screenshots)
- [Highlights](#highlights)
- [Algorand URI's ABNF Grammar](#algorand-uri-abnf-grammar)
- [Installation](#installation)
- [Usage](#usage)
- [Error correction level](#error-correction-level)
- [API](#api)
- [GS1 QR Codes](#gs1-qr-codes)
- [Mentioned Trademarks](#mentioned-trademarks)
- [Credits](#credits)
- [License](#license)

## Screenshots
<div style="display:block">

<img style="display:inline-block;cursor:pointer" title="QR Generator CLI example" src="./examples/images/algorand-payment-qr-cli.png" height="auto" width="150">
<img style="display:inline-block;cursor:pointer" title="QR Generation express API example" src="./examples/images/algorand-payment-qr-api-server.png" height="auto" width="150">
<img style="display:inline-block;cursor:pointer" title="QR Generation node example" src="./examples/images/algorand-payment-qr-static-server.png" height="auto" width="150">
<img style="display:inline-block;cursor:pointer" title="QR Generator web form example" src="./examples/images/algorand-payment-qr-web-form.png" height="auto" width="150">

</div>

## Highlights
- This library can be built for browser, be imported or required in NodeJS or directly rendered in terminal.
- Supports RFC 3986 and Algorand URI ABNF Grammar
- Automatically escapes HTML
- CLI utility
- Save QR code as image (SVG, PNG, JPEG,...)
- Support for some styling and colors (dark , light,..)
- Support for chinese, cyrillic, greek and japanese characters in transaction labels and notes
- Auto generates optimized segments for best data compression and smallest QR Code size
- App agnostic readability, Generated QR Codes by definition are app agnostic

## Algorand URI ABNF Grammar

```javascript
    algorandurn     = "algorand://" algorandaddress [ "?" algorandparams ]
    algorandaddress = *base32
    algorandparams  = algorandparam [ "&" algorandparams ]
    algorandparam   = [ amountparam / labelparam / noteparam / assetparam / otherparam ]
    amountparam     = "amount=" *digit
    labelparam      = "label=" *qchar
    assetparam      = "asset=" *digit
    noteparam       = (xnote | note)
    xnote           = "xnote=" *qchar
    note            = "note=" *qchar
```


## Installation
Inside your project folder do:

```shell
npm install --save algorand-payment-qr
```
and then 

```shell
cd bin && node qrcode
```

or, install it globally to use `qrcode` from the command line to save Algorand URI qrcode and barcode   images or generate ones you can view in your terminal.

```shell
npm install -g algorand-payment-qr
```
and then 

```shell
qrcode [options]
```

## Usage
### CLI

```
Usage: qrcode [options]

Algorand switch:
  -x, --xnote Expects "xnote" instread of "note" for Algorand URI      [boolean]

Algorand options:
  -a, --amount Amount (in Micro Algos) of Algorand payment transaction  [number]
  -l, --label Label of Algorand payment transaction                     [string]
  -s, --asset Algorand asset id (in case of Algorand ASA transfer)      [string]
  -n, --note note/xnote (depends on -a | --xnote switch)                [string]
  -d, --dest Destination Wallet address (Algorand account address)      [string]

QR Code options:
  -v, --qversion  QR Code symbol version (1 - 40)                       [number]
  -e, --error     Error correction level           [choices: "L", "M", "Q", "H"]
  -m, --mask      Mask pattern (0 - 7)                                  [number]


Renderer options:
  -t, --type        Output type                  [choices: "png", "svg", "utf8"]
  -w, --width       Image width (px)                                    [number]
  -r, --ratio       Scale ratio factor                                  [number]
  -q, --qzone       Quiet zone size                                     [number]
  -b, --background  Light RGBA hex color
  -f, --foreground   Dark RGBA hex color
  -p, --puny  Output smaller QR code to terminal                       [boolean]
  -i, --inverse  Invert foreground and background colors               [boolean]

Options:
  -o, --output  Output file
  -h, --help    Show help                                              [boolean]
  --version     Show version number                                    [boolean]

Examples:
    - Draw in terminal window:
    node qrcode -a 1000000 -l "Coffee" -s 45 -n "This is a test transaction for Algorand payment QR code generator" -p
    - Save as png image:
    node qrcode -o algorandQR.png -a 1000000 -l "Coffee" -s 45 -n "This is a test transaction for Algorand payment QR code generator"
    - Use red as foreground color:
    node qrcode -f F00 -o algorandQR.png -a 1000000 -l "Coffee" -s 45 -x -n "This is a test transaction for Algorand payment QR code generator"
```
If not specified, output type is guessed from file extension.<br>
Recognized extensions are `png`, `svg` and `txt`.

### Browser
`algorand-payment-qr` can be used in browser through including the precompiled bundle present in `build/` folder.



```javascript
// index.js -> bundle.js
var QRCode = require('algorand-payment-qr')
var canvas = document.getElementById('canvas')

QRCode.toCanvas(canvas, {wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (error) {
  if (error) console.error(error)
  console.log('success!');
})
```

#### Precompiled bundle
```html
<canvas id="canvas"></canvas>

<script src="/build/qrcode.js"></script>
<script>
  QRCode.toCanvas(document.getElementById('canvas'), {wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
</script>
```

If you install through `npm`, precompiled files will be available in `node_modules/algorand-payment-qr/build/` folder.

The precompiled bundle have support for [Internet Explorer 10+, Safari 5.1+, and all evergreen browsers](https://browserl.ist/?q=defaults%2C+IE+%3E%3D+10%2C+Safari+%3E%3D+5.1).

### NodeJS
Require the module `algorand-payment-qr`

```javascript
var QRCode = require('algorand-payment-qr')

QRCode.toDataURL({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, url) {
  console.log(url)
})
```

render a qrcode for the terminal
```js
var QRCode = require('algorand-payment-qr')

QRCode.toString({type:'terminal',wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, url) {
  console.log(url)
})
```

### ES6/ES7
Promises and Async/Await can be used in place of callback function.

```javascript
import QRCode from 'algorand-payment-qr'

// With promises
QRCode.toDataURL({})
  .then(url => {
    console.log(url)
  })
  .catch(err => {
    console.error(err)
  })

// With async/await
const generateQR = async text => {
  try {
    console.log(await QRCode.toDataURL({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}))
  } catch (err) {
    console.error(err)
  }
}
```

## Error correction level
Error correction capability allows to successfully scan a QR Code even if the symbol is dirty or damaged.
Four levels are available to choose according to the operating environment.

Higher levels offer a better error resistance but reduce the symbol's capacity.<br>
If the chances that the QR Code symbol may be corrupted are low (for example if it is showed through a monitor)
is possible to safely use a low error level such as `Low` or `Medium`.

Possible levels are shown below:

| Level            | Error resistance |
|------------------|:----------------:|
| **L** (Low)      | **~7%**          |
| **M** (Medium)   | **~15%**         |
| **Q** (Quartile) | **~25%**         |
| **H** (High)     | **~30%**         |

The percentage indicates the maximum amount of damaged surface after which the symbol becomes unreadable.

Error level can be set through `options.errorCorrectionLevel` property.<br>
If not specified, the default value is `M`.

```javascript
QRCode.toDataURL({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com", errorCorrectionLevel: 'H'}, function (err, url) {
  console.log(url)
})
```

## API
Browser:
- [create()](#createtext-options)
- [toCanvas()](#tocanvascanvaselement-text-options-cberror)
- [toDataURL()](#todataurltext-options-cberror-url)
- [toString()](#tostringtext-options-cberror-string)

Server:
- [create()](#createtext-options)
- [toCanvas()](#tocanvascanvas-text-options-cberror)
- [toDataURL()](#todataurltext-options-cberror-url-1)
- [toString()](#tostringtext-options-cberror-string-1)
- [toFile()](#tofilepath-text-options-cberror)
- [toFileStream()](#tofilestreamstream-text-options)

### Browser API
#### `create([options])`
Creates QR Code symbol and returns a qrcode object.

##### `options`

See [QR Code options](#qr-code-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `returns`
Type: `Object`

```javascript
// QRCode object
{
  modules,              // Bitmatrix class with modules data
  version,              // Calculated QR Code version
  errorCorrectionLevel, // Error Correction Level
  maskPattern,          // Calculated Mask pattern
  segments              // Generated segments
}
```

<br>

#### `toCanvas(canvasElement, [options], [cb(error)])`
#### `toCanvas([options], [cb(error, canvas)])`
Draws qr code symbol to canvas.<br>
If `canvasElement` is omitted a new canvas is returned.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.


##### `options`

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toCanvas({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, canvas) {
  if (err) throw err

  var container = document.getElementById('container')
  container.appendChild(canvas)
})
```

<br>

#### `toDataURL([options], [cb(error, url)])`
#### `toDataURL(canvasElement, [options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.<br>
If provided, `canvasElement` will be used as canvas to generate the data URI.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `options`

- ###### `type`
  Type: `String`<br>
  Default: `image/png`

  Data URI format.<br>
  Possible values are: `image/png`, `image/jpeg`, `image/webp`.<br>

- ###### `rendererOpts.quality`
  Type: `Number`<br>
  Default: `0.92`

  A Number between `0` and `1` indicating image quality if the requested type is `image/jpeg` or `image/webp`.

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
var opts = {
  wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q",
  label:"emg110@gmail.com",
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 1,
  color: {
    dark:"#010599FF",
    light:"#FFBF60FF"
  }
}

QRCode.toDataURL(opts, function (err, url) {
  if (err) throw err

  var img = document.getElementById('image')
  img.src = url
})
```
<br>

#### `toString([options], [cb(error, string)])`

Returns a string representation of the QR Code.<br>


##### `options`

- ###### `type`
  Type: `String`<br>
  Default: `utf8`

  Output format.<br>
  Possible values are: `terminal`,`utf8`, and `svg`.

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toString({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, string) {
  if (err) throw err
  console.log(string)
})
```

<br>


### Server API
#### `create([options])`
See [create](#createtext-options).<br>
See [Algorand URI options](#algorand-uri-params).

<br>

#### `toCanvas(canvas, [options], [cb(error)])`
Draws qr code symbol to [node canvas](https://github.com/Automattic/node-canvas).



##### `options`

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

<br>

#### `toDataURL([options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.<br>
Only works with `image/png` type for now.


##### `options`
See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

<br>

#### `toString([options], [cb(error, string)])`
Returns a string representation of the QR Code.<br>
If choosen output format is `svg` it will returns a string containing xml code.

##### `options`

###### `type`
  Type: `String`<br>
  Default: `utf8`

  Output format.<br>
  Possible values are: `utf8`, `svg`, `terminal`.

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toString({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com", type: 'utf8'}, function (err, string) {
  if (err) throw err
  console.log(string)
})
```

<br>

#### `toFile(path, [options], [cb(error)])`
Saves QR Code to image file.<br>
If `options.type` is not specified, the format will be guessed from file extension.<br>
Recognized extensions are `png`, `svg`, `txt`.

##### `path`
Type: `String`

Path where to save the file.


##### `options`

- ###### `type`
  Type: `String`<br>
  Default: `png`

  Output format.<br>
  Possible values are: `png`, `svg`, `utf8`.

- ###### `rendererOpts.deflateLevel` **(png only)**
  Type: `Number`<br>
  Default: `9`

  Compression level for deflate.

- ###### `rendererOpts.deflateStrategy` **(png only)**
  Type: `Number`<br>
  Default: `3`

  Compression strategy for deflate.

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).

##### `cb`
Type: `Function`

Callback function called on finish.

##### Example
```javascript
QRCode.toFile('path/to/filename.png', {
  wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q",
  label:"emg110@gmail.com",
  color: {
    dark: '#00F',  // Blue dots
    light: '#0000' // Transparent background
  }
}, function (err) {
  if (err) throw err
  console.log('done')
})
```

<br>

#### `toFileStream(stream, [options])`
Writes QR Code image to stream. Only works with `png` format for now.

##### `stream`
Type: `stream.Writable`

Node stream.


##### `options`

See [All Options](#all-options).<br>
See [Algorand URI options](#algorand-uri-params).


### All Options

#### QR Code options

##### `version`
  Type: `Number`<br>

  QR Code version. If not specified the more suitable value will be calculated.
    
##### `errorCorrectionLevel`
  Type: `String`<br>
  Default: `M`

  Error correction level.<br>
  Possible values are `low, medium, quartile, high` or `L, M, Q, H`.

##### `maskPattern`
  Type: `Number`<br>

  Mask pattern used to mask the symbol.<br>
  Possible values are `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`.<br>
  If not specified the more suitable value will be calculated.

  
#### Algorand URI params

##### `xnote`
  Type: `Boolean`<br>

  Specifies if the xnote or note field is used for Algorand URI construction.
  
##### `amount`
  Type: `Number`<br>

  Amount of Algorand transaction in MicroAlgos or Standard Asset Unit.
  
##### `label`
  Type: `String`<br>

  Label of Algorand payment transaction.

##### `asset`
  Type: `String`<br>

  Asset Id of Algorand payment transaction if used. If not specified Algo will be used as payment fungible token.
  
##### `note`
  Type: `String`<br>

  note or xnote field content of Algorand payment transaction. The xnote option determines the name of the field with this content to be note or xnote.


#### Renderers options
##### `margin`
  Type: `Number`<br>
  Default: `4`

  Define how much wide the quiet zone should be.

##### `scale`
  Type: `Number`<br>
  Default: `4`

  Scale factor. A value of `1` means 1px per modules (black dots).

##### `small`
  Type: `Boolean`<br>
  Default: `false`

  Relevant only for terminal renderer. Outputs smaller QR code.

##### `width`
  Type: `Number`<br>

  Forces a specific width for the output image.<br>
  If width is too small to contain the qr symbol, this option will be ignored.<br>
  Takes precedence over `scale`.

##### `color.dark`
Type: `String`<br>
Default: `#000000ff`

Color of dark module. Value must be in hex format (RGBA).<br>
Note: dark color should always be darker than `color.light`.

##### `color.light`
Type: `String`<br>
Default: `#ffffffff`

Color of light module. Value must be in hex format (RGBA).<br>


## GS1 QR Codes
What defines a GS1 qrcode is a header with metadata that describes your gs1 information.
(Coming soon...)


## License
[MIT](https://github.com/emg110/algorand-payment-qr/blob/master/license)


## Credits
> This repository uses and appreciates great open source software and code by forking, extention and integration of:
-  [node-qrcode](https://github.com/soldair/node-qrcode)
-  [escape-html](https://github.com/component/escape-html)
-  [encodeurl](https://github.com/pillarjs/encodeurl)
-  The idea for this lib was inspired by:
   -  Algorand developers portal Article [Payment Prompts with Algorand Mobile Wallet](https://developer.algorand.org/articles/payment-prompts-with-algorand-mobile-wallet/ ) ,from Jason Paulos.
-  This lib is indirectly based on "QRCode for JavaScript", MIT licensed by Kazuhiko Arase.

## Banner image curtsey
-  [Payment Prompts with Algorand Mobile Wallet](https://developer.algorand.org/articles/payment-prompts-with-algorand-mobile-wallet/ ), Article's banner from Jason Paulos.


## Mentioned Trademarks
"QR Code" curtsey of :<br>
[<img title="DENSO WAVE Incorporated" src="https://milliontech.com/wp-content/uploads/2017/01/Denso-Wave-Logo-300x102.png" height="auto" width="128">](https://www.denso-wave.com)



"Algorand" curtsey of:<br>
[<img title="Algorand Technologies" src="https://www.algorand.com/assets/media-kit/logos/full/png/algorand_full_logo_black.png" height="auto" width="128">](https://algorand.com)

