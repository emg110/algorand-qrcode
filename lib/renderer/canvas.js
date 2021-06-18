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
  
  
  if(options.withBgLogo){
      const img = new Image;
      
      img.src = options.bgLogo;
      const frame = ctx.getImageData(0, 0, size, size);
      const tpx = new Utils.PixelCore();
      
      const topThreshold = opts.darkThreshold || 25;
      const bottomThreshold = opts.lightThreshold || 75;
  
      tpx.threshold = 50;
  
      // scale image
      let w = size;
      let h = size;
  
      if (img.width > img.height) {
        w = w * (size / h);
        h = size;
      } else {
        h = h * (size / w);
        w = size;
      }
      ctx.drawImage(img, 0, 0, w, h);
  
      try {
        tpx.iterate(
          canvasEl,
          function (px, i, l, pixels, w, h, pixelCore) {
            const luma = 0.2125 * px.r + 0.7154 * px.g + 0.0721 * px.b;
            const codeLuma = Utils.luma709Only(
              frame.data[i * 4],
              frame.data[i * 4 + 1],
              frame.data[i * 4 + 2]
            );
            let yuv;
            let rgb;
  
            if (codeLuma > pixelCore.threshold) {
              if (luma < bottomThreshold) {
                yuv = Utils.rgbToYuv(px.r, px.g, px.b);
  
                rgb = Utils.yuvToRgb2(bottomThreshold, yuv[1], yuv[2]);
  
                px.r = rgb[0];
                px.g = rgb[1];
                px.b = rgb[2];
                px.a = 255;
              }
            } else {
              if (luma > topThreshold) {
                yuv = Utils.rgbToYuv(px.r, px.g, px.b);
  
                rgb = Utils.yuvToRgb2(topThreshold, yuv[1], yuv[2]);
  
                px.r = rgb[0];
                px.g = rgb[1];
                px.b = rgb[2];
              }
            }
          }
        );
        return canvasEl
      } catch (e) {
        console.log(e)
      }
    
  }
  if(options.withLogo){
    const img = new Image;
    
    img.src = options.logo;
    const imgDim={width:options.logoSize || 50,height:options.logoSize || 50};
  
 
      
    img.onload = function() {
      ctx.drawImage(img, 
        canvasEl.width / 2 - imgDim.width / 2,
        canvasEl.height / 2 - imgDim.height / 2,imgDim.width,imgDim.height);
    };        
    return canvasEl
  
}
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