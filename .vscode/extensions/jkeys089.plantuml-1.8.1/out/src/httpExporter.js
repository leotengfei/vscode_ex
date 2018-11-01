'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const urlMaker_1 = require("./urlMaker");
const planuml_1 = require("./planuml");
class HttpExporter {
    /**
     * export a diagram to Buffer.
     * @param diagram The diagram to export.
     * @param format format of export file.
     * @returns A Promise of Buffer.
     */
    exportToBuffer(diagram, format) {
        return this.doExport(diagram, format);
    }
    doExport(diagram, format) {
        let pURL = urlMaker_1.urlMaker.makeURL(diagram, config_1.config.urlServer, format, null);
        var request = require('request');
        // console.log("Exporting preview image from %s", pURL.url);
        let pms = new Promise((resolve, reject) => {
            request({ method: 'GET',
                uri: pURL.url,
                encoding: null // for byte encoding. Otherwise string.
                ,
                gzip: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    resolve(body);
                }
                else {
                    let stderror;
                    if (!error) {
                        stderror = "Unexpected Statuscode: "
                            + response.statusCode + "\n"
                            + "for GET " + pURL.url;
                    }
                    else {
                        stderror = error.message;
                        body = new Buffer("");
                    }
                    stderror = planuml_1.localize(10, null, diagram.title, stderror);
                    reject({ error: stderror, out: body });
                }
            });
        });
        return { promise: pms };
    }
}
exports.httpExporter = new HttpExporter();
//# sourceMappingURL=httpExporter.js.map