import QRCode from "qrcode-svg"
import QRCodeTerminal from "./terminal"


import { isBrowser, isNode, isWebWorker, isJsDom, isDeno } from "browser-or-node";
function parseOptions(args) {
    /* 
  content: "http://github.com/",
  padding: 4,
  width: 256,
  height: 256,
  color: "#000000",
  background: "#ffffff",
  ecl: "M",
*/
    let content = "algorand://"
    let amount = args.amount;
    let wallet = args.wallet;
    let label = args.label;
    let asset = args.asset;
    let note = args.note;
    if (!!label && !!wallet) {
        content = "algorand://" + wallet+ "?" + "&label=" + label;
    } else if (!!asset && !!wallet) {
        if (!!note && amount > 0) {
            content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&asset=" + asset + "&note=" + note;
        } else if (amount > 0) {
            content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&asset=" + asset;
        } else if (amount === 0) {
            content = "algorand://?" + "amount=0"  + "&asset=" + asset;
        }

    } else if (!!note && !!wallet && !!amount) {
        content = "algorand://" + wallet+ "?" + "&amount=" + amount + "&note=" + note;
    } else if ( !!wallet && !!amount){
        content = "algorand://" + wallet+ "?" + "&amount=" + amount;
    }
    let options = {
        content: content,
        container: "svg-viewbox",
        ecl: args.ecl || "H",
        file: args.file || "algorand-qrcode.svg",
        padding: args.margin || 4,
        width: args.width || 256,
        height: args.height || 256,
        output: args.output || "terminal",
        background: args.background || "#e1dede",
        color: args.color || "#000000"
    }
    return options
}

export default function algoqrcode (options) {
    if (isBrowser) {
        let opts = parseOptions(options)
        let qrcode = new QRCode(opts);
        return qrcode

    } else if (isNode) {
        if (options.output === 'svg') {
            let opts = parseOptions(options)
            let  qrcode  = new QRCode(opts);
            return qrcode
        } else {
            let opts = parseOptions(options)
            return QRCodeTerminal.generate(opts.content);
        }


    }

}

