"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const adm_zip = require("adm-zip");
const fs = require("fs-extra");
const http = require("http");
const https = require("https");
const HttpsProxyAgent = require("https-proxy-agent");
const _temp = require("temp");
const url = require("url");
const util_1 = require("util");
const vscode = require("vscode");
const temp = _temp.track();
const HTTP_PROXY = process.env.http_proxy || process.env.HTTP_PROXY;
const proxy = vscode.workspace.getConfiguration("http").get("proxy") || HTTP_PROXY;
let agent = null;
if (proxy) {
    if (proxy !== "") {
        agent = new HttpsProxyAgent(proxy);
    }
}
class Util {
    static HttpPostJson(path, obj, headers) {
        return new Promise((resolve, reject) => {
            const item = url.parse(path);
            const postData = JSON.stringify(obj);
            const newHeader = Object.assign({ "Content-Length": Buffer.byteLength(postData), "Content-Type": "application/json" }, headers);
            const options = {
                host: item.hostname,
                path: item.path,
                headers: newHeader,
                method: "POST"
            };
            if (item.port) {
                options.port = +item.port;
            }
            if (agent != null) {
                options.agent = agent;
            }
            if (item.protocol.startsWith("https:")) {
                const req = https.request(options, res => {
                    if (res.statusCode !== 200) {
                        // reject();
                        // return;
                    }
                    let result = "";
                    res.setEncoding("utf8");
                    res.on("data", (chunk) => {
                        result += chunk;
                    });
                    res.on("end", () => resolve(result));
                    res.on("error", (err) => reject(err));
                });
                req.write(postData);
                req.end();
            }
            else {
                const req = http.request(options, res => {
                    let result = "";
                    res.setEncoding("utf8");
                    res.on("data", (chunk) => {
                        result += chunk;
                    });
                    res.on("end", () => resolve(result));
                    res.on("error", (err) => reject(err));
                });
                req.write(postData);
                req.end();
            }
        });
    }
    static HttpGetFile(path) {
        const tempFile = temp.path();
        const file = fs.createWriteStream(tempFile);
        const item = url.parse(path);
        const options = {
            host: item.hostname,
            path: item.path
        };
        if (item.port) {
            options.port = +item.port;
        }
        if (agent != null) {
            options.agent = agent;
        }
        return new Promise((resolve, reject) => {
            if (path.startsWith("https:")) {
                https
                    .get(options, res => {
                    res.pipe(file);
                    file.on("finish", () => {
                        file.close();
                        resolve(tempFile);
                    });
                })
                    .on("error", e => {
                    reject(e);
                });
            }
            else {
                http
                    .get(options, res => {
                    // return value
                    res.pipe(file);
                    file.on("finish", () => {
                        file.close();
                        resolve(tempFile);
                    });
                })
                    .on("error", e => {
                    reject(e);
                });
            }
        });
    }
    static WriteToFile(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempFile = temp.path();
            yield fs.writeFile(tempFile, content);
            return tempFile;
        });
    }
    static Extract(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirName = temp.path();
            const zip = new adm_zip(filePath);
            yield util_1.promisify(temp.mkdir)(dirName);
            zip.extractAllTo(dirName, /*overwrite*/ true);
            return dirName;
        });
    }
    static Sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(ms);
                }, ms);
            });
        });
    }
    /**
     * promisify the function
     * it will be remove when vscode use node@^8.0
     * @param fn
     */
    static promisify(fn) {
        return function (...argv) {
            return new Promise((resolve, reject) => {
                fn.call(this, ...argv, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        };
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map