const canPromise = require('./can-promise')
const QRCode = require('./core/qrcode')
const PngRenderer = require('./renderer/png')
const Utf8Renderer = require('./renderer/utf8')
const TerminalRenderer = require('./renderer/terminal')
const SvgRenderer = require('./renderer/svg')


function checkParams (alrorandURI, opts, cb) {
  if (typeof alrorandURI === 'undefined') {
    throw new Error('String required as first argument')
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

exports.create = QRCode.create

exports.toCanvas = require('./browser').toCanvas

exports.toString = function toString (alrorandURI, opts, cb) {
  const params = checkParams(alrorandURI, opts, cb)
  const type = params.opts ? params.opts.type : undefined
  const renderer = getStringRendererFromType(type)
  return render(renderer.render, alrorandURI, params)
}

exports.toDataURL = function toDataURL (alrorandURI, opts, cb) {
  const params = checkParams(alrorandURI, opts, cb)
  const renderer = getRendererFromType(params.opts.type)
  return render(renderer.renderToDataURL, alrorandURI, params)
}

exports.toBuffer = function toBuffer (alrorandURI, opts, cb) {
  const params = checkParams(alrorandURI, opts, cb)
  const renderer = getRendererFromType(params.opts.type)
  return render(renderer.renderToBuffer, alrorandURI, params)
}

exports.toFile = function toFile (path, alrorandURI, opts, cb) {
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

exports.toFileStream = function toFileStream (stream, alrorandURI, opts) {
  if (arguments.length < 2) {
    throw new Error('Too few arguments provided')
  }

  const params = checkParams(alrorandURI, opts, stream.emit.bind(stream, 'error'))
  const renderer = getRendererFromType('png') // Only png support for now
  const renderToFileStream = renderer.renderToFileStream.bind(null, stream)
  render(renderToFileStream, alrorandURI, params)
}

