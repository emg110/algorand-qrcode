const Utils = require('./utils')


const rgbToHsl = function(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [h, s, l];
}

/**
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  l       The lightness
* @return  Array           The RGB representation
*/
const hslToRgb= function(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

/**
* Converts an RGB color value to HSV. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSV_color_space.
* Assumes r, g, and b are contained in the set [0, 255] and
* returns h, s, and v in the set [0, 1].
*
* @param   Number  r       The red color value
* @param   Number  g       The green color value
* @param   Number  b       The blue color value
* @return  Array           The HSV representation
*/
const rgbToHsv= function(r, g, b){
  r = r/255, g = g/255, b = b/255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if(max == min){
      h = 0; // achromatic
  }else{
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [h, s, v];
}

/**
* Converts an HSV color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSV_color_space.
* Assumes h, s, and v are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   Number  h       The hue
* @param   Number  s       The saturation
* @param   Number  v       The value
* @return  Array           The RGB representation
*/
const hsvToRgb= function(h, s, v){
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch(i % 6){
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }

  return [r * 255, g * 255, b * 255];
}

//NOTE YUV is a lossy conversion
const rgbToYuv= function(r,g,b){
var Wr = 0.2126
,Wb = 0.0722
,Wg = 1-Wr-Wb
,Umax = 0.436
,Vmax = 0.615;

var y = Wr*r+Wg*g+Wb*b
,u = Umax*((b-y)/(1-Wb))
,v = Vmax*((r-y)/(1-Wr));

return [y,u,v];
}

//NOTE YUV is a lossy conversion. its useful though so dont write it off yet ;)
const yuvToRgb= function(r,g,b){
var Wr = 0.2126
,Wb = 0.0722
,Wg = 0.7152//1-Wr-Wb
,Umax = 0.436
,Vmax = 0.615;

var y = Wr*r+Wg*g+Wb*b
,u = Umax*((b-y)/(1-Wb))
,v = Vmax*((r-y)/(1-Wr));

return [y,u,v];
}

const yuvToRgb2= function(y,u,v){
var Wr = 0.2126
,Wb = 0.0722
,Wg = 0.7152//1-Wr-Wb
,Umax = 0.436
,Vmax = 0.615;
//TODO pre calculate known values
var r = y+(v*(1-Wr/Vmax))
,g = y-(u*(Wb*(1-Wb)/(Umax-Wg)))-(v*(Wr*(1-Wr)/Vmax*Wg))
,b = y+(u*((1-Wb)/Umax));

return [r,g,b];
}

const luma709Only= function(r,g,b){
return (0.2125*r + 0.7154*g + 0.0721*b)
}

function PixelCore(){}

PixelCore.prototype = {
	//used in threshold transforms.
	threshold:50,
	iterate:function(canvas,cb){
		var ctx = canvas.getContext('2d')
		,frame = ctx.getImageData(0, 0, canvas.width, canvas.height),o={};
		
		for (var i = 0,l=frame.data.length/4; i < l; i++) {
			o.r = frame.data[i * 4 + 0];
			o.g = frame.data[i * 4 + 1];
			o.b = frame.data[i * 4 + 2];
			o.a = frame.data[i * 4 + 3];

			if(cb(o,i,l,frame.data,canvas.width, canvas.height,this) === false){
				break;
			}

			frame.data[i * 4 + 0] = o.r;
			frame.data[i * 4 + 1] = o.g;
			frame.data[i * 4 + 2] = o.b;
			frame.data[i * 4 + 3] = o.a;
		}
		
		ctx.putImageData(frame, 0, 0);
	},
	transforms:{
		grayscale:{
			lightness:function(px){
				px.r = px.g = px.b = (Math.max(px.r, px.g, px.b) + Math.min(px.r, px.g, px.b)) / 2;
			},
			average:function(px){
				px.r = px.g = px.b = (px.r + px.g + px.b) / 3;
			},
			luma:function(px){
				//BT709 - HD tv standard - http://en.wikipedia.org/wiki/Rec._709
				px.r = px.b = px.g = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b);
			},
			lumaY:function(px){
				//(YIQ/NTSC) Red: 0.299 Green: 0.587 Blue: 0.114 
				px.r = px.b = px.g = (0.299*px.r + 0.587*px.g + 0.114*px.b);
			},
			lumaRMY:function(px){
				//Red: 0.5 Green: 0.419 Blue: 0.081
				//dont know where RMY comes from but it yeilds interesting results
				px.r = px.b = px.g = (0.5*px.r + 0.419*px.g + 0.081*px.b);
			}
		},
		//brightens everything below a threshold to threshold
		brightenThreshold:function(px,i,l,pixels,w,h,pixelCore){
			var hsl = rgbToHsl(px.r,px.g,px.b),rgb;

			if(hsl[1] < pixelCore.threshold/100) {
				//http://en.wikipedia.org/wiki/HSL_and_HSV

				rgb = hslToRgb(hsl[0],pixelCore.threshold/100,hsl[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		saturationThreshold:function(px,i,l,pixels,w,h,pixelCore){
			var hsv = rgbToHsv(px.r,px.g,px.b),rgb;
			
			if(hsv[1] > pixelCore.threshold/100) {
				//http://en.wikipedia.org/wiki/HSL_and_HSV

				rgb = hsvToRgb(hsv[0],pixelCore.threshold/100,hsv[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		dimThreshold:function(px,i,l,pixels,w,h,pixelCore){

			var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b)
			if(luma > pixelCore.threshold) {
				var yuv = rgbToYuv(px.r,px.g,px.b),rgb;
				
				rgb = yuvToRgb(pixelCore.threshold,yuv[1],yuv[2]);
				
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		lightenThreshold:function(px,i,l,pixels,w,h,pixelCore){

			var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b)
			if(luma < pixelCore.threshold) {
				var yuv = rgbToYuv(px.r,px.g,px.b),rgb;
				
				rgb = yuvToRgb(pixelCore.threshold,yuv[1],yuv[2]);
				
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		},
		
		debug:{
			
			traceBrightenThreshold:function(px,i,l,pixels,w,h,pixelCore){
				var hsl = rgbToHsl(px.r,px.g,px.b),rgb;

				if(hsl[1] > pixelCore.threshold/100) {
					px.r = 0;
					px.g = 255;
					px.b = 0;
				}
			},
			
			traceSaturationThreshold:function(px,i,l,pixels,w,h,pixelCore){
				var hsv = rgbToHsv(px.r,px.g,px.b),rgb;
				
				if(hsv[1] > pixelCore.threshold/100) {
					//http://en.wikipedia.org/wiki/HSL_and_HSV

					px.r = 0;//rgb[0];
					px.g = 255;//rgb[1];
					px.b = 0;//rgb[2];
				}
			},
			
			traceDimThreshold:function(px,i,l,pixels,w,h,pixelCore){	
				var luma = (0.2125*px.r + 0.7154*px.g + 0.0721*px.b);
				if(luma < pixelCore.threshold) {
					px.r = 0;
					px.g = 255;
					px.b = 0;
				}
			},
			
			yuvAndBack:function(px){
				var yuv = rgbToYuv(px.r,px.g,px.b);
				var rgb = yuvToRgb(yuv[0],yuv[1],yuv[2]);
				px.r = rgb[0];
				px.g = rgb[1];
				px.b = rgb[2];
			}
		}
	}
}
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
  
  if(options.withBgLogo && options.bgLogo){
      const img = new Image;
      
      img.src = options.bgLogo;
      const frame = ctx.getImageData(0, 0, size, size);
      const tpx = new PixelCore();
      
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
            const codeLuma = luma709Only(
              frame.data[i * 4],
              frame.data[i * 4 + 1],
              frame.data[i * 4 + 2]
            );
            let yuv;
            let rgb;
  
            if (codeLuma > pixelCore.threshold) {
              if (luma < bottomThreshold) {
                yuv = rgbToYuv(px.r, px.g, px.b);
  
                rgb = yuvToRgb2(bottomThreshold, yuv[1], yuv[2]);
  
                px.r = rgb[0];
                px.g = rgb[1];
                px.b = rgb[2];
                px.a = 255;
              }
            } else {
              if (luma > topThreshold) {
                yuv = rgbToYuv(px.r, px.g, px.b);
  
                rgb = yuvToRgb2(topThreshold, yuv[1], yuv[2]);
  
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
  if(options.withLogo && options.logo){
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