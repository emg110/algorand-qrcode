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
