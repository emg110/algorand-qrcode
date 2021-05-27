const express = require("express");
const app = express(); // .createServer()
const http = require("http");
const fs = require("fs");
const QRCode = require("../lib");
const canvasutil = require("canvasutil");
const { createCanvas, loadImage } = require("canvas");
const favicon = require('express-favicon');
const path = require("path");

// app.use(express.methodOverride())
// app.use(express.bodyParser())
// app.use(app.router)
app.use(express.static(path.resolve(__dirname, '../examples')))

app.use(favicon(__dirname + '/favicon.ico'));


app.get("/", function (req, res) {
  fs.readFile(path.join(__dirname, "index.html"), function (err, data) {
    res.send(data ? data.toString() : err);
  });
});

const effectHandlers = {};

app.get("/generate", function (req, res) {
  const q = req.query || {};

  let effect = q.effect || "plain";
  if (!effectHandlers[effect]) {
    effect = "plain";
  }

  effectHandlers[effect](q, (error, canvas) => {
    if (!error) {
      canvas.toBuffer(function (err, buf) {
        if (!err) {
          res.header("Content-Type", "image/png");
          res.send(buf);
        }
      });
    } else {
      const msg = error.message + "\n" + error.stack;
      res.header("Content-Type", "text/plain");
      res.send(msg);
      console.error(msg);
    }
  });
});

effectHandlers.node = function (args, cb) {
  args.src = path.join(__dirname, "images", "node.png");
  this.image(args, cb);
};

effectHandlers.npm = function (args, cb) {
  args.src = path.join(__dirname, "images", "npm.png");
  this.image(args, cb);
};
effectHandlers.myalgo = function (args, cb) {
  args.src = path.join(__dirname, "images", "myalgo.png");
  this.image(args, cb);
};

effectHandlers.algorand = function (args, cb) {
  args.src = path.join(__dirname, "images", "algorand_logo_mark_black.png");
  this.image(args, cb);
};

effectHandlers.image = function (args, cb) {
  loadImage(args.src || "").then(
    (img) => {
      const convert = canvasutil.conversionLib;
      const canvas = createCanvas(200, 200);
      QRCode.toCanvas(canvas, args).then((res) => {
        
        let canvas = res[0];
        const codeCtx = canvas.getContext("2d");
        const frame = codeCtx.getImageData(0, 0, canvas.width, canvas.width);
        const tpx = new canvasutil.PixelCore();
        const algorandCanvas = createCanvas(canvas.width, canvas.width);
        const ctx = algorandCanvas.getContext("2d");
        const topThreshold = args.darkThreshold || 25;
        const bottomThreshold = args.lightThreshold || 75;

        tpx.threshold = 50;

        // scale image
        let w = canvas.width;
        let h = canvas.height;

        if (img.width > img.height) {
          w = w * (canvas.height / h);
          h = canvas.height;
        } else {
          h = h * (canvas.height / w);
          w = canvas.width;
        }
        ctx.drawImage(img, 0, 0, w, h);

        try {
          tpx.iterate(
            algorandCanvas,
            function (px, i, l, pixels, w, h, pixelCore) {
              const luma = 0.2125 * px.r + 0.7154 * px.g + 0.0721 * px.b;
              const codeLuma = convert.luma709Only(
                frame.data[i * 4],
                frame.data[i * 4 + 1],
                frame.data[i * 4 + 2]
              );
              let yuv;
              let rgb;

              if (codeLuma > pixelCore.threshold) {
                if (luma < bottomThreshold) {
                  yuv = convert.rgbToYuv(px.r, px.g, px.b);

                  rgb = convert.yuvToRgb(bottomThreshold, yuv[1], yuv[2]);

                  px.r = rgb[0];
                  px.g = rgb[1];
                  px.b = rgb[2];
                  px.a = 255;
                }
              } else {
                if (luma > topThreshold) {
                  yuv = convert.rgbToYuv(px.r, px.g, px.b);

                  rgb = convert.yuvToRgb(topThreshold, yuv[1], yuv[2]);

                  px.r = rgb[0];
                  px.g = rgb[1];
                  px.b = rgb[2];
                }
              }
            }
          );
        } catch (e) {
          cb(err, false);
        }

        cb(null, algorandCanvas);
      }).catch((err)=>{
        cb(err, false);
      });
    },
    (error) => {
      cb(error, null);
    }
  );
};

effectHandlers.plain = function (args, cb) {
  const canvas = createCanvas(200, 200);

  QRCode.toCanvas(canvas, args)
    .then((canvas) => {
      cb(false, canvas[0]);
    })
    .catch((error) => {
      console.log(error);
    });
};

app.listen(3031);
console.log("listening on 3031");
