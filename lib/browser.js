
const canPromise = require('./can-promise');

const QRCode = require('./core/qrcode');
const CanvasRenderer = require('./renderer/canvas');
const SvgRenderer = require('./renderer/svg-tag.js');
const {escapeHtml, encodeUrl} = require('../lib/renderer/utils');

/**
 *
 * @function
 * @name constructUri
 * @desc Constructs an Algorand URI from given Algorand spec options
 * @param {*} options
 * @return {String}
 */
function constructUri (options){
  let {wallet, xnote, note, label, amount, asset, html, other} = options;
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
    
    
  }else if(asset && amount){
    alrorandURI = `algorand://${wallet}?amount=${amount}&asset=${asset}${xnote ? '&xnote='+note : '&note='+note}`
    
  }else if(!asset && amount){
    alrorandURI = `algorand://${wallet}?amount=${amount}&label=${label}${xnote ? '&xnote='+note : '&note='+note}`
   
  }
  if(!!other && typeof other === 'string'){
    alrorandURI = alrorandURI + '&other=' + other
   
  }

  if(html)alrorandURI = escapeHtml(alrorandURI);
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
function renderCanvas (renderFunc, canvas, opts) {

  return new Promise(function (resolve, reject) {
    try {
      
      const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
    
      const data = QRCode.create(alrorandURI, opts)
     
      resolve([renderFunc(data, canvas, opts), alrorandURI])
    } catch (e) {
      reject(e)
    }
  })
}

exports.escapeHtml = escapeHtml
exports.encodeUrl = encodeUrl
exports.create = QRCode.create
exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render)
exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL)

// only svg for now.
exports.toString = renderCanvas.bind(null, function (data, _, opts) {
  return SvgRenderer.render(data, opts)
})
