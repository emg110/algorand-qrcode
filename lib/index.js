const canPromise = require('./can-promise')
const QRCode = require('./core/qrcode')
const PngRenderer = require('./renderer/png')
const Utf8Renderer = require('./renderer/utf8')
const TerminalRenderer = require('./renderer/terminal')
const SvgRenderer = require('./renderer/svg')
const Utils = require('../lib/renderer/utils')



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
    if(asset.length===0)asset = undefined;

  }
  if(amount){
    if(!(Number(amount)>0)){
      amount = undefined;
    }else{
      amount = Number(!asset ? amount * 1000000 : amount);
    }
    
  }
  if(label){
    if(label.length === 0){
      label = undefined;
    }
    
  }

  if( label && wallet){
    alrorandURI = `algorand://${wallet}?label=${label}`
    console.log('Label and wallet detected => It is a contact label Algorand URI: ', alrorandURI)
    
  }else if(asset && amount && wallet){
    alrorandURI = `algorand://${wallet}?amount=${amount}&asset=${asset}`
    console.log('Asset, amount and wallet detected => It is an asset transfer transaction Algorand URI: ', alrorandURI)
    
  }else if(!asset && amount && wallet){
    alrorandURI = `algorand://${wallet}?amount=${amount}`
    console.log('Amount and wallet detected => It is a payment transaction Algorand URI: ', alrorandURI)
   
  }
  if(!!note || !!xnote){
    alrorandURI = alrorandURI + `${xnote ? '&xnote='+note : '&note='+note}`
    console.log('Note detected => Adding to Algorand URI: ', alrorandURI)
   
  }

  if(html)alrorandURI = escapeHtml(alrorandURI);
  console.log('HTML option detected => Escaping HTML for Algorand URI: ', alrorandURI)
  console.log('Encodeding Algorand URI...')
  alrorandURI = encodeUrl(alrorandURI);
  console.log('Generated Algorand URI: ', alrorandURI)
  return alrorandURI;
}


function checkParams (alrorandURI, opts, cb) {
  if (typeof alrorandURI === 'undefined') {
    throw new Error('alrorandURI required as first argument')
  }

  if (typeof cb === 'undefined') {
    cb = opts
    opts = {}
  }

  if (typeof cb !== 'function') {
    if (!canPromise()) {
      throw new Error('Callback required as last argument')
    } else {
      opts = cb || {}
      cb = null
    }
  }

  return {
    opts: opts,
    cb: cb
  }
}

function getTypeFromFilename (path) {
  return path.slice((path.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

function getRendererFromType (type) {
  switch (type) {
    case 'svg':
      return SvgRenderer

    case 'txt':
    case 'utf8':
      return Utf8Renderer

    case 'png':
    case 'image/png':
    default:
      return PngRenderer
  }
}

function getStringRendererFromType (type) {
  switch (type) {
    case 'svg':
      return SvgRenderer

    case 'terminal':
      return TerminalRenderer

    case 'utf8':
    default:
      return Utf8Renderer
  }
}

function render (renderFunc, alrorandURI, params) {
  
  if (!params.cb) {
    return new Promise(function (resolve, reject) {
      try {
        const data = QRCode.create(alrorandURI, params.opts)
        return renderFunc(data, params.opts, function (err, data) {
          return err ? reject(err) : resolve(data)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  try {
    const data = QRCode.create(alrorandURI, params.opts)
    return renderFunc(data, params.opts, params.cb)
  } catch (e) {
    params.cb(e)
  }
}

const escapeHtml = Utils.escapeHtml
const encodeUrl = Utils.encodeUrl
const create = QRCode.create

const toCanvas = require('./browser').toCanvas

const toString = function (opts, cb) {
  const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
  const params = checkParams(alrorandURI, opts, cb)
  const type = params.opts ? params.opts.type : undefined
  const renderer = getStringRendererFromType(type)
  return render(renderer.render, alrorandURI, params)
}


const toDataURL = function (opts, cb) {
  const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
  const params = checkParams(alrorandURI, opts, cb)
  const type = params.opts ? params.opts.type : undefined
  const renderer = getRendererFromType(type)
  
  return render(renderer.renderToDataURL, alrorandURI, params)
}

const toBuffer = function (opts, cb) {
  const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
  const params = checkParams(alrorandURI, opts, cb)
  const renderer = getRendererFromType(params.opts.type)
  return render(renderer.renderToBuffer, alrorandURI, params)
}

const toFile = function (path, opts, cb) {
  const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
  if (typeof path !== 'string' || !(typeof alrorandURI === 'string' || typeof alrorandURI === 'object')) {
    throw new Error('Invalid argument')
  }

  if ((arguments.length < 3) && !canPromise()) {
    throw new Error('Too few arguments provided')
  }

  const params = checkParams(alrorandURI, opts, cb)
  const type = params.opts.type || getTypeFromFilename(path)
  const renderer = getRendererFromType(type)
  const renderToFile = renderer.renderToFile.bind(null, path)

  return render(renderToFile, alrorandURI, params)
}

const toFileStream = function (stream, opts) {
  const alrorandURI = !opts.rawUri ? constructUri(opts) : opts.rawUri
  if (arguments.length < 2) {
    throw new Error('Too few arguments provided')
  }

  const params = checkParams(alrorandURI, opts, stream.emit.bind(stream, 'error'))
  const renderer = getRendererFromType('png') // Only png support for now
  const renderToFileStream = renderer.renderToFileStream.bind(null, stream)
  render(renderToFileStream, alrorandURI, params)
}

module.exports = {toFileStream, toFile , toBuffer, toDataURL, toString, toCanvas}