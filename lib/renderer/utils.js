const UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
const ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g
const UNMATCHED_SURROGATE_PAIR_REPLACE = "$1\uFFFD$2";
const matchHtmlRegExp = /["'&<>]/

/**
 *
 * @function
 * @name hex2rgba
 * @param {String} hex
 * @returns {*}
 */
function hex2rgba(hex) {
  if (typeof hex === "number") {
    hex = hex.toString();
  }

  if (typeof hex !== "string") {
    throw new Error("Color should be defined as hex string");
  }

  let hexCode = hex.slice().replace("#", "").split("");
  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    throw new Error("Invalid hex color: " + hex);
  }

  // Convert from short to long form (fff -> ffffff)
  if (hexCode.length === 3 || hexCode.length === 4) {
    hexCode = Array.prototype.concat.apply(
      [],
      hexCode.map(function (c) {
        return [c, c];
      })
    );
  }

  // Add default alpha value
  if (hexCode.length === 6) hexCode.push("F", "F");

  const hexValue = parseInt(hexCode.join(""), 16);

  return {
    r: (hexValue >> 24) & 255,
    g: (hexValue >> 16) & 255,
    b: (hexValue >> 8) & 255,
    a: hexValue & 255,
    hex: "#" + hexCode.slice(0, 6).join(""),
  };
}


/**
 *
 * @function
 * @name getOptions
 * @param {*} options
 * @returns {*}
 */
exports.getOptions = function getOptions(options) {
  if (!options) options = {};
  if (!options.color) options.color = {};

  const margin =
    typeof options.margin === "undefined" ||
    options.margin === null ||
    options.margin < 0
      ? 4
      : options.margin;

  const width =
    options.width && options.width >= 21 ? options.width : undefined;
  const scale = options.scale || 4;

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || "#000000ff"),
      light: hex2rgba(options.color.light || "#ffffffff"),
    },
    type: options.type,
    inverse: Boolean(options.inverse),
    html: Boolean(options.html),
    rendererOpts: options.rendererOpts || {},
  };
};

/**
 *
 * @function
 * @name getScale
 * @param {Number} qrSize
 * @param {*} opts
 * @returns {Number}
 */
exports.getScale = function getScale(qrSize, opts) {
  return opts.width && opts.width >= qrSize + opts.margin * 2
    ? opts.width / (qrSize + opts.margin * 2)
    : opts.scale;
};

/**
 *
 * @function
 * @name getImageWidth
 * @param {Number} qrSize
 * @param {*} opts
 * @returns {Number}
 */
exports.getImageWidth = function getImageWidth(qrSize, opts) {
  const scale = exports.getScale(qrSize, opts);
  return Math.floor((qrSize + opts.margin * 2) * scale);
};

/**
 *
 * @function
 * @name qrToImageData
 * @param {*} imgData
 * @param {*} qr
 * @param {*} opts
 * @returns {*} imgData
 */
exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
  const size = qr.modules.size;
  const data = qr.modules.data;
  const scale = exports.getScale(size, opts);
  const symbolSize = Math.floor((size + opts.margin * 2) * scale);
  const scaledMargin = opts.margin * scale;
  const palette = !opts.inverse ? [opts.color.light, opts.color.dark] : [opts.color.dark, opts.color.light];

  for (let i = 0; i < symbolSize; i++) {
    for (let j = 0; j < symbolSize; j++) {
      let posDst = (i * symbolSize + j) * 4;
      let pxColor = opts.color.light;

      if (
        i >= scaledMargin &&
        j >= scaledMargin &&
        i < symbolSize - scaledMargin &&
        j < symbolSize - scaledMargin
      ) {
        const iSrc = Math.floor((i - scaledMargin) / scale);
        const jSrc = Math.floor((j - scaledMargin) / scale);
        pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
      }

      imgData[posDst++] = pxColor.r;
      imgData[posDst++] = pxColor.g;
      imgData[posDst++] = pxColor.b;
      imgData[posDst] = pxColor.a;
    }
  }
  return imgData
};

/**
 *
 * @function
 * @name escapeHtml
 * @param {String} string
 * @returns {String}
 */
exports.escapeHtml = function escapeHtml(string) {
  var str = "" + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = "";
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 39: // '
        escape = "&#39;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
};

/**
 *
 * @function
 * @name encodeUrl
 * @desc encodes to RFC 3986 percent separated
 * @param {String} url
 * @returns {String}
 */
exports.encodeUrl = function encodeUrl(url) {
  const regExpAlphaNumeric = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
  const regExpSpecial = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=.-]+$/g;
const isAlpha = url.match(regExpAlphaNumeric)
const isSpecial = url.match(regExpSpecial)

if(isAlpha){
  return String(url)
}else if(!isSpecial){
  return String(url).replace(/ /g, '_')
}else{
  return String(url.replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE)
  .replace(ENCODE_CHARS_REGEXP, encodeURI))
}

   
};



exports.rgbToHsl = function(r, g, b){
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
exports.hslToRgb= function(h, s, l){
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
exports.rgbToHsv= function(r, g, b){
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
exports.hsvToRgb= function(h, s, v){
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
exports.rgbToYuv= function(r,g,b){
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
exports.yuvToRgb= function(r,g,b){
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

exports.yuvToRgb2= function(y,u,v){
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

exports.luma709Only= function(r,g,b){
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

exports.PixelCore= PixelCore