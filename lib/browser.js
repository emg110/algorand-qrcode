
const canPromise = require('./can-promise');

const QRCode = require('./core/qrcode');
const CanvasRenderer = require('./renderer/canvas');
const SvgRenderer = require('./renderer/svg-tag.js');
const { escapeHtml, encodeUrl } = require('../lib/renderer/utils');
const jsQR = require("jsqr-es6");

/**
 *
 * @function
 * @name constructUri
 * @desc Constructs an Algorand URI from given Algorand spec options
 * @param {*} options
 * @return {String}
 */
function constructUri(options) {
  let { wallet, xnote, note, label, amount, asset, html } = options;
  let alrorandURI = '';
  if (asset) {
    if (asset.length === 0) asset = undefined;

  }
  if (amount) {
    if (!(Number(amount) > 0)) {
      amount = undefined;
    } else {
      amount = Number(!asset ? amount * 1000000 : amount);
    }

  }
  if (label) {
    if (label.length === 0) {
      label = undefined;
    }

  }

  if (label && wallet) {
    alrorandURI = `algorand://${wallet}?label=${label}`
    console.log('Label and wallet detected => It is a contact label Algorand URI: ', alrorandURI)

  } else if (asset && amount && wallet) {
    alrorandURI = `algorand://${wallet}?amount=${amount}&asset=${asset}`
    console.log('Asset, amount and wallet detected => It is an asset transfer transaction Algorand URI: ', alrorandURI)

  } else if (!asset && amount && wallet) {
    alrorandURI = `algorand://${wallet}?amount=${amount}`
    console.log('Amount and wallet detected => It is a payment transaction Algorand URI: ', alrorandURI)

  }
  if (!!note || !!xnote) {
    alrorandURI = alrorandURI + `${xnote ? '&xnote=' + note : '&note=' + note}`
    console.log('Note detected => Adding to Algorand URI: ', alrorandURI)

  }

  if (html) alrorandURI = escapeHtml(alrorandURI);
  console.log('HTML option detected => Escaping HTML for Algorand URI: ', alrorandURI)
  console.log('Encodeding Algorand URI...')
  alrorandURI = encodeUrl(alrorandURI);
  console.log('Generated Algorand URI: ', alrorandURI)
  return alrorandURI;
}

/**
 *
 * @function
 * @name renderCanvas
 * @desc Renders an generated Algorand QR Code into canvas
 * @param {Function} renderFunc
 * @param {Blob} canvas
 * @param {*} opts
 * @return {Promise}
 */
function renderCanvas(renderFunc, canvas, opts) {
  if (!opts && !!canvas) {
    opts = canvas
  }
  return new Promise(function (resolve, reject) {

    try {
      let alrorandURI
      if (!opts.rawUri) {
        alrorandURI = constructUri(opts)
      } else {
        alrorandURI = opts.rawUri
      }
      const data = QRCode.create(alrorandURI, opts)
      resolve({ dataUrl: renderFunc(data, canvas, opts), alrorandURI })
    } catch (e) {
      reject(e)
    }
  })
}

exports.jsQR = jsQR
exports.escapeHtml = escapeHtml
exports.encodeUrl = encodeUrl
exports.create = QRCode.create
exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render)
exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL)

// only svg for now.
exports.toString = renderCanvas.bind(null, function (data, _, opts) {
  return SvgRenderer.render(data, opts)
})
