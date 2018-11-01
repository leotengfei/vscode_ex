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
const vscode = require("vscode");
const enums_1 = require("../enums");
const util = require("../util");
const apiPath = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
const extensionDir = ".vscode";
class ExtensionInformation {
    static fromJSON(text) {
        // TODO: JSON.parse may throw error
        // Throw custom error should be more friendly
        const obj = JSON.parse(text);
        const meta = new ExtensionMetadata(obj.meta.galleryApiUrl, obj.meta.id, obj.meta.downloadUrl, obj.meta.publisherId, obj.meta.publisherDisplayName, obj.meta.date);
        const item = new ExtensionInformation();
        item.metadata = meta;
        item.name = obj.name;
        item.publisher = obj.publisher;
        item.version = obj.version;
        return item;
    }
    static fromJSONList(text) {
        const extList = [];
        try {
            // TODO: JSON.parse may throw error
            // Throw custom error should be more friendly
            const list = JSON.parse(text);
            list.forEach(obj => {
                const meta = new ExtensionMetadata(obj.metadata.galleryApiUrl, obj.metadata.id, obj.metadata.downloadUrl, obj.metadata.publisherId, obj.metadata.publisherDisplayName, obj.metadata.date);
                const item = new ExtensionInformation();
                item.metadata = meta;
                item.name = obj.name;
                item.publisher = obj.publisher;
                item.version = obj.version;
                if (item.name !== "code-settings-sync") {
                    extList.push(item);
                }
            });
        }
        catch (err) {
            console.error("Sync : Unable to Parse extensions list", err);
        }
        return extList;
    }
}
exports.ExtensionInformation = ExtensionInformation;
class ExtensionMetadata {
    constructor(galleryApiUrl, id, downloadUrl, publisherId, publisherDisplayName, date) {
        this.galleryApiUrl = galleryApiUrl;
        this.id = id;
        this.downloadUrl = downloadUrl;
        this.publisherId = publisherId;
        this.publisherDisplayName = publisherDisplayName;
        this.date = date;
    }
}
exports.ExtensionMetadata = ExtensionMetadata;
class PluginService {
    static GetMissingExtensions(remoteExt, ignoredExtensions) {
        const hashset = {};
        const remoteList = ExtensionInformation.fromJSONList(remoteExt);
        const localList = this.CreateExtensionList();
        const missingList = [];
        for (const ext of localList) {
            if (hashset[ext.name] == null) {
                hashset[ext.name] = ext;
            }
        }
        for (const ext of remoteList) {
            if (hashset[ext.name] == null &&
                ignoredExtensions.includes(ext.name) === false) {
                missingList.push(ext);
            }
        }
        return missingList;
    }
    static GetDeletedExtensions(remoteList, ignoredExtensions) {
        const localList = this.CreateExtensionList();
        const deletedList = [];
        // for (var i = 0; i < remoteList.length; i++) {
        //     var ext = remoteList[i];
        //     var found: boolean = false;
        //     for (var j = 0; j < localList.length; j++) {
        //         var localExt = localList[j];
        //         if (ext.name == localExt.name) {
        //             found = true;
        //             break;
        //         }
        //     }
        //     if (!found) {
        //         deletedList.push(localExt);
        //     }
        // }
        for (const ext of localList) {
            let found = false;
            if (ext.name !== "code-settings-sync") {
                for (const localExt of remoteList) {
                    if (ext.name === localExt.name ||
                        ignoredExtensions.includes(ext.name)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    deletedList.push(ext);
                }
            }
        }
        return deletedList;
    }
    static CreateExtensionList() {
        const list = [];
        for (const ext of vscode.extensions.all) {
            if (ext.extensionPath.includes(extensionDir) && // skip if not install from gallery
                ext.packageJSON.isBuiltin === false) {
                const meta = ext.packageJSON.__metadata || {
                    id: ext.packageJSON.uuid,
                    publisherId: ext.id,
                    publisherDisplayName: ext.packageJSON.publisher
                };
                const data = new ExtensionMetadata(meta.galleryApiUrl, meta.id, meta.downloadUrl, meta.publisherId, meta.publisherDisplayName, meta.date);
                const info = new ExtensionInformation();
                info.metadata = data;
                info.name = ext.packageJSON.name;
                info.publisher = ext.packageJSON.publisher;
                info.version = ext.packageJSON.version;
                list.push(info);
            }
        }
        return list;
    }
    static DeleteExtension(item, ExtensionFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const destination = path.join(ExtensionFolder, item.publisher + "." + item.name + "-" + item.version);
            try {
                yield fs.remove(destination);
                return true;
            }
            catch (err) {
                console.log("Sync : " + "Error in uninstalling Extension.");
                console.log(err);
                throw err;
            }
        });
    }
    static DeleteExtensions(extensionsJson, extensionFolder, ignoredExtensions) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteList = ExtensionInformation.fromJSONList(extensionsJson);
            const deletedList = PluginService.GetDeletedExtensions(remoteList, ignoredExtensions);
            const deletedExt = [];
            if (deletedList.length === 0) {
                return deletedExt;
            }
            for (const selectedExtension of deletedList) {
                try {
                    yield PluginService.DeleteExtension(selectedExtension, extensionFolder);
                    deletedExt.push(selectedExtension);
                }
                catch (err) {
                    console.error("Sync : Unable to delete extension " +
                        selectedExtension.name +
                        " " +
                        selectedExtension.version);
                    console.error(err);
                    throw deletedExt;
                }
            }
            return deletedExt;
        });
    }
    static InstallExtensions(extensions, extFolder, useCli, ignoredExtensions, osType, insiders, notificationCallBack) {
        return __awaiter(this, void 0, void 0, function* () {
            let actionList = [];
            let addedExtensions = [];
            const missingList = PluginService.GetMissingExtensions(extensions, ignoredExtensions);
            if (missingList.length === 0) {
                notificationCallBack("Sync : No Extensions needs to be installed.");
                return [];
            }
            if (useCli) {
                addedExtensions = yield PluginService.ProcessInstallationCLI(missingList, osType, insiders, notificationCallBack);
                return addedExtensions;
            }
            else {
                actionList = yield this.ProcessInstallation(extFolder, notificationCallBack, missingList);
                try {
                    yield Promise.all(actionList);
                    return addedExtensions;
                }
                catch (err) {
                    // always return extension list
                    return addedExtensions;
                }
            }
        });
    }
    static ProcessInstallationCLI(missingList, osType, isInsiders, notificationCallBack) {
        return __awaiter(this, void 0, void 0, function* () {
            const addedExtensions = [];
            const exec = require("child_process").exec;
            notificationCallBack("TOTAL EXTENSIONS : " + missingList.length);
            notificationCallBack("");
            notificationCallBack("");
            let myExt = process.argv0;
            console.log(myExt);
            let codeLastFolder = "";
            let codeCliPath = "";
            if (osType === enums_1.OsType.Windows) {
                if (isInsiders) {
                    codeLastFolder = "Code - Insiders";
                    codeCliPath = "bin/code-insiders";
                }
                else {
                    codeLastFolder = "Code";
                    codeCliPath = "bin/code";
                }
            }
            else if (osType === enums_1.OsType.Linux) {
                if (isInsiders) {
                    codeLastFolder = "code-insiders";
                    codeCliPath = "bin/code-insiders";
                }
                else {
                    codeLastFolder = "code";
                    codeCliPath = "bin/code";
                }
            }
            else if (osType === enums_1.OsType.Mac) {
                codeLastFolder = "Frameworks";
                codeCliPath = "Resources/app/bin/code";
            }
            myExt =
                '"' +
                    myExt.substr(0, myExt.lastIndexOf(codeLastFolder)) +
                    codeCliPath +
                    '"';
            for (let i = 0; i < missingList.length; i++) {
                const missExt = missingList[i];
                const name = missExt.publisher + "." + missExt.name;
                const extensionCli = myExt + " --install-extension " + name;
                notificationCallBack(extensionCli);
                try {
                    const installed = yield new Promise(res => {
                        exec(extensionCli, (err, stdout, stderr) => {
                            if (!stdout && (err || stderr)) {
                                notificationCallBack(err || stderr);
                                res(false);
                            }
                            notificationCallBack(stdout);
                            res(true);
                        });
                    });
                    if (installed) {
                        notificationCallBack("");
                        notificationCallBack("EXTENSION : " +
                            (i + 1) +
                            " / " +
                            missingList.length.toString() +
                            " INSTALLED.", true);
                        notificationCallBack("");
                        notificationCallBack("");
                        addedExtensions.push(missExt);
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
            return addedExtensions;
        });
    }
    static ProcessInstallation(extFolder, notificationCallBack, missingList) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionList = [];
            const addedExtensions = [];
            let totalInstalled = 0;
            for (const element of missingList) {
                actionList.push(PluginService.InstallExtension(element, extFolder).then(() => {
                    totalInstalled = totalInstalled + 1;
                    notificationCallBack("Sync : Extension " +
                        totalInstalled +
                        " of " +
                        missingList.length.toString() +
                        " installed.", false);
                    addedExtensions.push(element);
                }, (err) => {
                    console.error(err);
                    notificationCallBack("Sync : " + element.name + " Download Failed.", true);
                }));
            }
            return actionList;
        });
    }
    static InstallExtension(item, ExtensionFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const header = {
                Accept: "application/json;api-version=3.0-preview.1"
            };
            let extractPath = null;
            const data = {
                filters: [
                    {
                        criteria: [
                            {
                                filterType: 4,
                                value: item.metadata.id
                            }
                        ]
                    }
                ],
                flags: 133
            };
            try {
                const res = yield util.Util.HttpPostJson(apiPath, data, header);
                let downloadUrl;
                try {
                    let targetVersion = null;
                    const content = JSON.parse(res);
                    // Find correct version
                    for (const result of content.results) {
                        for (const extension of result.extensions) {
                            for (const version of extension.versions) {
                                if (version.version === item.version) {
                                    targetVersion = version;
                                    break;
                                }
                            }
                            if (targetVersion !== null) {
                                break;
                            }
                        }
                        if (targetVersion !== null) {
                            break;
                        }
                    }
                    if (targetVersion === null ||
                        !targetVersion ||
                        !targetVersion.assetUri) {
                        // unable to find one
                        throw new Error("NA");
                    }
                    // Proceed to install
                    downloadUrl =
                        targetVersion.assetUri +
                            "/Microsoft.VisualStudio.Services.VSIXPackage?install=true";
                    console.log("Installing from Url :" + downloadUrl);
                }
                catch (error) {
                    if (error === "NA" || error.message === "NA") {
                        console.error("Sync : Extension : '" +
                            item.name +
                            "' - Version : '" +
                            item.version +
                            "' Not Found in marketplace. Remove the extension and upload the settings to fix this.");
                    }
                    console.error(error);
                    throw error;
                }
                const filePath = yield util.Util.HttpGetFile(downloadUrl);
                const dir = yield util.Util.Extract(filePath);
                extractPath = dir;
                const packageJson = yield PluginService.GetPackageJson(dir, item);
                Object.assign(packageJson, {
                    __metadata: item.metadata
                });
                const text = JSON.stringify(packageJson, null, " ");
                yield PluginService.WritePackageJson(extractPath, text);
                // Move the folder to correct path
                const destination = path.join(ExtensionFolder, item.publisher + "." + item.name + "-" + item.version);
                const source = path.join(extractPath, "extension");
                yield PluginService.CopyExtension(destination, source);
            }
            catch (err) {
                console.error(`Sync : Extension : '${item.name}' - Version : '${item.version}'` + err);
                throw err;
            }
        });
    }
    static CopyExtension(destination, source) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.copy(source, destination, { overwrite: true });
        });
    }
    static WritePackageJson(dirName, packageJson) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.writeFile(dirName + "/extension/package.json", packageJson, "utf-8");
        });
    }
    static GetPackageJson(dirName, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield fs.readFile(dirName + "/extension/package.json", "utf-8");
            const config = JSON.parse(text);
            if (config.name !== item.name) {
                throw new Error("name not equal");
            }
            if (config.publisher !== item.publisher) {
                throw new Error("publisher not equal");
            }
            if (config.version !== item.version) {
                throw new Error("version not equal");
            }
            return config;
        });
    }
}
exports.PluginService = PluginService;
//# sourceMappingURL=pluginService.js.map