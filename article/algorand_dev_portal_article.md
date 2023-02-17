Introducing `algorand-qrcode` a comprehensive JavaScript module with a complete set of tools to generate an standard Algorand URI and render a QR code from it, exportable to SVG, PNG and UTF8. Exportable output to File, UTF8 text string and DataURL. Works in Terminal, Node and modern browsers. Contains full set of examples including API server, static server and web form QR generator. Includes a full featured CLI to generate QR codes in terminal or create image files on the fly.
[![QR Generator CLI example](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/generated-qr.png?raw=true =128x128)](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/generated-qr.png?raw=true)



## Technical Notes
- Algorand URI reference specification: [Algorand payment prompts specification](https://developer.algorand.org/docs/reference/payment_prompts/).
- Requires NodeJS version later than 10 to build but runs everywhere.
- Since all the texts for Algorand URI fields are HTML Escaped and then RFC 3986 encoded, for label, note and xnote fields to deliver correct content after getting scanned by Algorand Wallet QR Scanner, either reading of HTML escaped string support should be added to Algorand Wallet QR scanner feature or their team inform this library's Author to remove the escaping feature from this code base.
- This library will closely follow Algorand's URI specification document drafts and published versions closely as well as Algorand Wallet QR Scanner feature to match and adopt new features, specification requirements and extensions.

## Table of Contents

- [Screenshots](#screenshots)
- [Highlights](#highlights)
- [Algorand URI's ABNF Grammar](#algorand-uri-abnf-grammar)
- [Installation](#installation)
- [Usage](#usage)
- [Error correction level](#error-correction-level)
- [API](#api)
- [GS1 QR Codes](#gs1-qr-codes)
- [Credits](#credits)
- [License](#license)

## Screenshots

[![QR Generator CLI example](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-cli.png?raw=true =128x128)](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-cli.png?raw=true)
[![QR Generation express API example](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-api-server.png?raw=true  =128x128)](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-api-server.png?raw=true)
[![QR Generation node example](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-static-server.png?raw=true  =128x128)](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-static-server.png?raw=true)
[![QR Generator web form example](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-web-form.png?raw=true  =128x128)](https://github.com/emg110/algorand-qrcode/blob/main/examples/images/algorand-qrcode-web-form.png?raw=true)


## Highlights

- This library can be built for browser, be imported or required in NodeJS or directly used in terminal.
- Supports RFC 3986 and Algorand URI ABNF Grammar.
- Automatically escapes label, note and xnote fields (This feature may be subject to change or deprecation).
- CLI utility and rendering.
- QR Error Correction Levels.
- Save QR code as image (SVG, PNG and JPEG).
- Support for foreground and background color configuration.
- Support for Chinese, Cyrillic, Greek and Japanese characters in transaction label, note and xnote fields.
- Auto generates optimized segments for best data compression and smallest QR Code size.
- Generated QR Codes by definition are App agnostic.

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
npm install --save algorand-qrcode
```
and then 

```shell
cd bin && node qrcode
```

or, install it globally to use `qrcode` from the command line to save Algorand URI qrcode images or generate ones to render in your terminal or browser if that's your usage.

```shell
npm install -g algorand-qrcode
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
  -x, --xnote Expects "xnote" instead of "note" for Algorand URI       [boolean]

Algorand options:
  -a, --amount Amount (in Micro Algos) of Algorand transaction          [number]
  -l, --label Label of Algorand transaction                             [string]
  -s, --asset Algorand asset id (in case of Algorand ASA transfer)      [string]
  -n, --note note/xnote (depends on -a | --xnote switch)                [string]
  -d, --dest Destination Wallet address (Algorand account address)      [string]

QR Code options:
  -v, --qversion  QR Code symbol version (1 - 40)                       [number]
  -e, --error     Error correction level           [choices: "L", "M", "Q", "H"]
  -m, --mask      Mask pattern (0 - 7)                                  [number]


Renderer options (Some only work with File renderer):
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
    node qrcode -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -a 1000000 -l "Coffee" -s 45 -n "This is a test transaction for Algorand QR Code generator" -p
    - Save as png image:
    node qrcode -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -o algorandQR.png -a 1000000 -l "Coffee" -s 45 -n "This is a test transaction for Algorand QR Code generator"
    - Use red as foreground color:
    node qrcode -d "LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q" -f F00 -o algorandQR.png -a 1000000 -l "Coffee" -s 45 -x -n "This is a test transaction for Algorand QR Code generator"
```
If not specified, output type is guessed from file extension.
Recognized extensions are `png`, `svg` and `txt`.

### Browser
`algorand-qrcode` can be used in browser through including the pre-compiled bundle present in `build/` folder after running `npm install` && `npm run build` in root directory.



```javascript
// index.js -> bundle.js
var QRCode = require('algorand-qrcode')
var canvas = document.getElementById('canvas')

QRCode.toCanvas(canvas, {wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (error) {
  if (error) console.error(error)
  console.log('success!');
})
```

#### Pre-compiled bundle
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

If you install and use as a package through `npm`, then pre-compiled files will be available in `node_modules/algorand-qrcode/build/` folder.

The pre-compiled bundle have support for [Internet Explorer 10+, Safari 5.1+, and all evergreen browsers](https://browserl.ist/?q=defaults%2C+IE+%3E%3D+10%2C+Safari+%3E%3D+5.1).

### NodeJS
Require the module `algorand-qrcode`

```javascript
var QRCode = require('algorand-qrcode')

QRCode.toDataURL({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, url) {
  console.log(url)
})
```

render a qrcode for the terminal
```js
var QRCode = require('algorand-qrcode')

QRCode.toString({type:'terminal',wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com"}, function (err, url) {
  console.log(url)
})
```

### ES6/ES7
Promises and Async/Await can be used in place of callback function.

```javascript
import * as QRCode from 'algorand-qrcode'
// With promises
QRCode.toDataURL({wallet:"AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI", label:"emg110@gmail.com"})
  .then(({ dataUrl, alrorandURI }) => {
    console.log(dataUrl)
    console.log(alrorandURI)
  })
  .catch(err => {
    console.error(err)
  })
// With async/await
const generateQR = async () => {
  try {
    console.log(await QRCode.toDataURL({wallet:"AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI", label:"emg110@gmail.com"}))
  } catch (err) {
    console.error(err)
  }
}
```

## Error correction level
Error correction capability allows to successfully scan a QR Code even if the symbol is dirty or damaged. Four levels are available to choose according to the operating environment.

Higher levels offer a better error resistance but reduce the symbol's capacity.

If the chances that the QR Code symbol may be corrupted are low (for example if it is showed through a monitor) is possible to safely use a low error level such as `Low` or `Medium`.

Possible levels are shown below:

| Level            | Error resistance |
|------------------|:----------------:|
| **L** (Low)      | **~7%**          |
| **M** (Medium)   | **~15%**         |
| **Q** (Quartile) | **~25%**         |
| **H** (High)     | **~30%**         |

The percentage indicates the maximum amount of damaged surface after which the symbol becomes unreadable.

Error level can be set through `options.errorCorrectionLevel` property.

If not specified, the default value is `M`.

```javascript
QRCode.toDataURL({wallet:"LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q", label:"emg110@gmail.com", errorCorrectionLevel: 'H'}, function (err, url) {
  console.log(url)
})
```

## API
Browser:

  - [create()](#algorand-uri-options)
  - [toCanvas()](#algorand-uri-options)
  - [toDataURL()](#algorand-uri-options)
  - [toString()](#algorand-uri-options)

Server:

  - [create()](#algorand-uri-options)
  - [toCanvas()](#algorand-uri-options)
  - [toDataURL()](#algorand-uri-options)
  - [toString()](#algorand-uri-options)
  - [toFile()](#algorand-uri-options)
  - [toFileStream()](#algorand-uri-options)

### Browser API
#### `create([options])`
Creates QR Code symbol and returns a qrcode object.

##### `options`

See [QR Code options](#qr-code-options).
See [Algorand URI options](#algorand-uri-options).

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



#### `toCanvas(canvasElement, [options], [cb(error)])`
#### `toCanvas([options], [cb(error, canvas)])`
Draws qr code symbol to canvas.
If `canvasElement` is omitted a new canvas is returned.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.


##### `options`

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

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

#### `toDataURL([options], [cb(error, url)])`
#### `toDataURL(canvasElement, [options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image. If provided, `canvasElement` will be used as canvas to generate the data URI.

##### `canvasElement`
Type: `DOMElement`

Canvas where to draw QR Code.

##### `options`

- ###### `type`
  Type: `String`
  Default: `image/png`

  Data URI format.
  Possible values are: `image/png`, `image/jpeg`, `image/webp`.

- ###### `rendererOpts.quality`
  Type: `Number`
  Default: `0.92`

  A Number between `0` and `1` indicating image quality if the requested type is `image/jpeg` or `image/webp`.

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

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


#### `toString([options], [cb(error, string)])`

Returns a string representation of the QR Code.


##### `options`

- ###### `type`
  Type: `String`
  Default: `utf8`

  Output format.
  Possible values are: `terminal`,`utf8`, and `svg`.

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

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


### Server API
#### `create([options])`
See [create](#createtext-options).
See [Algorand URI options](#algorand-uri-options).



#### `toCanvas(canvas, [options], [cb(error)])`
Draws qr code symbol to [node canvas](https://github.com/Automattic/node-canvas).



##### `options`

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

##### `cb`
Type: `Function`

Callback function called on finish.



#### `toDataURL([options], [cb(error, url)])`
Returns a Data URI containing a representation of the QR Code image.
Only works with `image/png` type for now.


##### `options`
See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

##### `cb`
Type: `Function`

Callback function called on finish.



#### `toString([options], [cb(error, string)])`
Returns a string representation of the QR Code.
If choosen output format is `svg` it will returns a string containing xml code.

##### `options`

###### `type`
  Type: `String`
  Default: `utf8`

  Output format.
  Possible values are: `utf8`, `svg`, `terminal`.

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

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


#### `toFile(path, [options], [cb(error)])`
Saves QR Code to image file.

If `options.type` is not specified, the format will be guessed from file extension. Recognized extensions are `png`, `svg`, `txt`.

##### `path`
Type: `String`

Path where to save the file.


##### `options`

- ###### `type`
  Type: `String`
  Default: `png`

  Output format.
  Possible values are: `png`, `svg`, `utf8`.

- ###### `rendererOpts.deflateLevel` **(png only)**
  Type: `Number`
  Default: `9`

  Compression level for deflate.

- ###### `rendererOpts.deflateStrategy` **(png only)**
  Type: `Number`
  Default: `3`

  Compression strategy for deflate.

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).

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



#### `toFileStream(stream, [options])`
Writes QR Code image to stream. Only works with `png` format for now.

##### `stream`
Type: `stream.Writable`

Node stream.


##### `options`

See [All Options](#all-options).
See [Algorand URI options](#algorand-uri-options).


### All Options

#### QR Code options

##### `version`
  Type: `Number`

  QR Code version. If not specified the more suitable value will be calculated.
    
##### `errorCorrectionLevel`
  Type: `String`
  Default: `M`

  Error correction level.
  Possible values are `low, medium, quartile, high` or `L, M, Q, H`.

##### `maskPattern`
  Type: `Number`

  Mask pattern used to mask the symbol.
  Possible values are `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`.
  If not specified the more suitable value will be calculated.

  
#### Algorand URI options

##### `xnote`
  Type: `Boolean`

  Specifies if the xnote or note field is used for Algorand URI construction.
  
##### `amount`
  Type: `Number`

  Amount of Algorand transaction in MicroAlgos or Standard Asset Unit.
  
##### `label`
  Type: `String`

  Label of Algorand transaction.

##### `asset`
  Type: `String`

  Asset Id of Algorand transaction if used. If not specified Algo will be used as payment token.
  
##### `note`
  Type: `String`

  note or xnote field content of Algorand transaction. The xnote option determines the name of the field with this content to be passed as note or xnote (Only one of note or xnote can be present on a single Algorand URI), for more information read [Algorand payment prompts specification](https://developer.algorand.org/docs/reference/payment_prompts/).


#### Renderer options
##### `margin`
  Type: `Number`
  Default: `4`

  Define how much wide the quiet zone should be.

##### `scale`
  Type: `Number`
  Default: `4`

  Scale factor. A value of `1` means 1px per modules (black dots).

##### `small`
  Type: `Boolean`
  Default: `false`

  Relevant only for terminal renderer. Outputs smaller QR code.

##### `width`
  Type: `Number`

  Forces a specific width for the output image.
  If width is too small to contain the qr symbol, this option will be ignored.
  Takes precedence over `scale`.

##### `color.dark`
Type: `String`
Default: `#000000ff`

Color of dark module. Value must be in hex format (RGBA).
Note: dark color should always be darker than `color.light`.

##### `color.light`
Type: `String`
Default: `#ffffffff`

Color of light module. Value must be in hex format (RGBA).


## GS1 QR Codes
What defines a GS1 qrcode is a header with metadata that describes your gs1 information.
(Coming soon...)


## License
[MIT](https://github.com/emg110/algorand-qrcode/blob/master/license)


## Credits
> Special appreciations to [Sheghzo](https://github.com/sheghzo/).

> This repository uses and appreciates great open source software and code by forking, extention and integration of:
-  [node-qrcode](https://github.com/soldair/node-qrcode)
-  [escape-html](https://github.com/component/escape-html)
-  [encodeurl](https://github.com/pillarjs/encodeurl)
-  The idea for this lib was inspired by [Payment Prompts with Algorand Mobile Wallet](https://developer.algorand.org/articles/payment-prompts-with-algorand-mobile-wallet/) authored by [Jason Paulos](https://developer.algorand.org/u/jason.paulos/).