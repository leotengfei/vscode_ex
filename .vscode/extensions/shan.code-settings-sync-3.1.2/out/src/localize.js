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
const fs = require("fs-extra");
const path = require("path");
class Localize {
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * translate the key
     * @param key
     * @param args
     */
    localize(key, ...args) {
        const languagePack = this.bundle;
        const message = languagePack[key] || key;
        return this.format(message, args);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bundle = yield this.resolveLanguagePack();
        });
    }
    /**
     * format the message
     * @param message
     * @param args
     */
    format(message, args = []) {
        let result;
        if (args.length === 0) {
            result = message;
        }
        else {
            result = message.replace(/\{(\d+)\}/g, (match, rest) => {
                const index = rest[0];
                return typeof args[index] !== "undefined" ? args[index] : match;
            });
        }
        return result;
    }
    /**
     * Get language pack
     */
    resolveLanguagePack() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultResvoleLanguage = ".nls.json";
            let resolvedLanguage = "";
            // TODO: it should read the extension root path from context
            const rootPath = path.join(__dirname, "..", "..");
            const file = path.join(rootPath, "package");
            const options = this.options;
            if (!options.locale) {
                resolvedLanguage = defaultResvoleLanguage;
            }
            else {
                let locale = options.locale;
                while (locale) {
                    const candidate = ".nls." + locale + ".json";
                    if (yield fs.pathExists(file + candidate)) {
                        resolvedLanguage = candidate;
                        break;
                    }
                    else {
                        const index = locale.lastIndexOf("-");
                        if (index > 0) {
                            locale = locale.substring(0, index);
                        }
                        else {
                            resolvedLanguage = ".nls.json";
                            locale = null;
                        }
                    }
                }
            }
            let defaultLanguageBundle = {};
            // if not use default language
            // then merger the Language pack
            // just in case the resolveLanguage bundle missing the translation and fallback with default language
            if (resolvedLanguage !== defaultResvoleLanguage) {
                defaultLanguageBundle = require(path.join(file + defaultResvoleLanguage));
            }
            const languageFilePath = path.join(file + resolvedLanguage);
            const isExistResolvedLanguage = yield fs.pathExists(languageFilePath);
            const ResolvedLanguageBundle = isExistResolvedLanguage
                ? require(languageFilePath)
                : {};
            // merger with default language bundle
            return Object.assign({}, defaultLanguageBundle, ResolvedLanguageBundle);
        });
    }
}
exports.Localize = Localize;
let config = {
    locale: "en"
};
try {
    config = Object.assign(config, JSON.parse(process.env.VSCODE_NLS_CONFIG));
}
catch (err) {
    //
}
const instance = new Localize(config);
const init = instance.init.bind(instance);
exports.init = init;
exports.default = instance.localize.bind(instance);
//# sourceMappingURL=localize.js.map