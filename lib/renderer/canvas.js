const Utils = require('./utils')

/**
 * 
 * @function
 * @name clearCanvas
 * @desc Gets a canvas as arg and clears it and brings it to riginal size
 * @param {*} ctx 
 * @param {*} canvas 
 * @param {Number} size 
 */
function clearCanvas (ctx, canvas, size) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (!canvas.style) canvas.style = {}
  canvas.height = size
  canvas.width = size
  canvas.style.height = size + 'px'
  canvas.style.width = size + 'px'
}

/**
 * 
 * @function
 * @name getCanvasElement
 * @desc creates a new element into document (current active web page document)
 */
function getCanvasElement () {
  try {
    return document.createElement('canvas')
  } catch (e) {
    throw new Error('You need to specify a canvas element')
  }
}

/**
 * 
 * @function
 * @name render
 * @desc Renders QRCode data into canvas by options
 * @param {*} qrData 
 * @param {*} canvas 
 * @param {*} options 
 * @return {*}
 */
function render (qrData, canvas, options) {
  let opts = options
  let canvasEl = canvas

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!canvas) {
    canvasEl = getCanvasElement()
  }

  opts = Utils.getOptions(opts)
  const size = Utils.getImageWidth(qrData.modules.size, opts)

  const ctx = canvasEl.getContext('2d')
  const image = ctx.createImageData(size, size)
  Utils.qrToImageData(image.data, qrData, opts)

  clearCanvas(ctx, canvasEl, size)
  ctx.putImageData(image, 0, 0)

  return canvasEl
}

/**
 * 
 * @function
 * @name renderToDataURL
 * @desc Renders QRCode data into a dataURL by options. Usable as src (image element) or background(css background image)
 * @param {*} qrData 
 * @param {*} canvas 
 * @param {*} options 
 * @return {String}
 */
function renderToDataURL (qrData, canvas, options) {
  let opts = options

  if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
    opts = canvas
    canvas = undefined
  }

  if (!opts) opts = {}

  const canvasEl = exports.render(qrData, canvas, opts)

  const type = opts.type || 'image/png'
  const rendererOpts = opts.rendererOpts || {}

  return canvasEl.toDataURL(type, rendererOpts.quality)
}

exports.render = render

exports.renderToDataURL = renderToDataURL