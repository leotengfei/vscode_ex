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
const chokidar = require("chokidar");
const fs = require("fs-extra");
const vscode = require("vscode");
const environmentPath_1 = require("./environmentPath");
const localize_1 = require("./localize");
const lockfile = require("./lockfile");
const fileService_1 = require("./service/fileService");
const setting_1 = require("./setting");
const util_1 = require("./util");
class Commons {
    constructor(en, context) {
        this.en = en;
        this.context = context;
        this.ERROR_MESSAGE = localize_1.default("common.error.message");
    }
    static LogException(error, message, msgBox, callback) {
        if (error) {
            console.error(error);
            if (error.code === 500) {
                message = localize_1.default("common.error.connection");
                msgBox = false;
            }
            else if (error.code === 4) {
                message = localize_1.default("common.error.canNotSave");
            }
            else if (error.message) {
                try {
                    message = JSON.parse(error.message).message;
                    if (message.toLowerCase() === "bad credentials") {
                        msgBox = true;
                        message = localize_1.default("common.error.invalidToken");
                        // vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/settings/tokens'));
                    }
                    if (message.toLowerCase() === "not found") {
                        msgBox = true;
                        message = localize_1.default("common.error.invalidGistId");
                    }
                }
                catch (error) {
                    // message = error.message;
                }
            }
        }
        if (msgBox === true) {
            vscode.window.showErrorMessage(message);
            vscode.window.setStatusBarMessage("").dispose();
        }
        else {
            vscode.window.setStatusBarMessage(message, 5000);
        }
        if (callback) {
            callback.apply(this);
        }
    }
    static GetInputBox(token) {
        if (token) {
            const options = {
                placeHolder: localize_1.default("common.placeholder.enterGithubAccessToken"),
                password: false,
                prompt: localize_1.default("common.prompt.enterGithubAccessToken"),
                ignoreFocusOut: true
            };
            return options;
        }
        else {
            const options = {
                placeHolder: localize_1.default("common.placeholder.enterGistId"),
                password: false,
                prompt: localize_1.default("common.prompt.enterGistId"),
                ignoreFocusOut: true
            };
            return options;
        }
    }
    StartWatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const lockExist = yield fileService_1.FileService.FileExists(this.en.FILE_SYNC_LOCK);
            if (!lockExist) {
                fs.closeSync(fs.openSync(this.en.FILE_SYNC_LOCK, "w"));
            }
            // check is sync locking
            if (yield lockfile.Check(this.en.FILE_SYNC_LOCK)) {
                yield lockfile.Unlock(this.en.FILE_SYNC_LOCK);
            }
            let uploadStopped = true;
            Commons.extensionWatcher = chokidar.watch(this.en.ExtensionFolder, {
                depth: 0,
                ignoreInitial: true
            });
            Commons.configWatcher = chokidar.watch(this.en.PATH + "/User/", {
                depth: 2,
                ignoreInitial: true
            });
            // TODO : Uncomment the following lines when code allows feature to update Issue in github code repo - #14444
            // Commons.extensionWatcher.on('addDir', (path, stat)=> {
            //     if (uploadStopped) {
            //         uploadStopped = false;
            //         this.InitiateAutoUpload().then((resolve) => {
            //             uploadStopped = resolve;
            //         }, (reject) => {
            //             uploadStopped = reject;
            //         });
            //     }
            //     else {
            //         vscode.window.setStatusBarMessage("");
            //         vscode.window.setStatusBarMessage("Sync : Updating In Progres... Please Wait.", 3000);
            //     }
            // });
            // Commons.extensionWatcher.on('unlinkDir', (path)=> {
            //     if (uploadStopped) {
            //         uploadStopped = false;
            //         this.InitiateAutoUpload().then((resolve) => {
            //             uploadStopped = resolve;
            //         }, (reject) => {
            //             uploadStopped = reject;
            //         });
            //     }
            //     else {
            //         vscode.window.setStatusBarMessage("");
            //         vscode.window.setStatusBarMessage("Sync : Updating In Progres... Please Wait.", 3000);
            //     }
            // });
            Commons.configWatcher.on("change", (path) => __awaiter(this, void 0, void 0, function* () {
                // check sync is locking
                if (yield lockfile.Check(this.en.FILE_SYNC_LOCK)) {
                    uploadStopped = false;
                }
                if (!uploadStopped) {
                    vscode.window.setStatusBarMessage("").dispose();
                    vscode.window.setStatusBarMessage(localize_1.default("common.info.updating"), 3000);
                    return false;
                }
                uploadStopped = false;
                yield lockfile.Lock(this.en.FILE_SYNC_LOCK);
                const settings = this.GetSettings();
                const customSettings = yield this.GetCustomSettings();
                if (customSettings == null) {
                    return;
                }
                let requiredFileChanged = false;
                if (customSettings.ignoreUploadFolders.indexOf("workspaceStorage") === -1) {
                    requiredFileChanged =
                        path.indexOf(this.en.FILE_SYNC_LOCK_NAME) === -1 &&
                            path.indexOf(".DS_Store") === -1 &&
                            path.indexOf(this.en.APP_SUMMARY_NAME) === -1 &&
                            path.indexOf(this.en.FILE_CUSTOMIZEDSETTINGS_NAME) === -1;
                }
                else {
                    requiredFileChanged =
                        path.indexOf(this.en.FILE_SYNC_LOCK_NAME) === -1 &&
                            path.indexOf("workspaceStorage") === -1 &&
                            path.indexOf(".DS_Store") === -1 &&
                            path.indexOf(this.en.APP_SUMMARY_NAME) === -1 &&
                            path.indexOf(this.en.FILE_CUSTOMIZEDSETTINGS_NAME) === -1;
                }
                console.log("Sync : File Change Detected On : " + path);
                if (requiredFileChanged) {
                    if (settings.autoUpload) {
                        if (customSettings.ignoreUploadFolders.indexOf("workspaceStorage") > -1) {
                            const fileType = path.substring(path.lastIndexOf("."), path.length);
                            if (fileType.indexOf("json") === -1) {
                                console.log("Sync : Cannot Initiate Auto-upload on This File (Not JSON).");
                                uploadStopped = true;
                                return;
                            }
                        }
                        console.log("Sync : Initiating Auto-upload For File : " + path);
                        this.InitiateAutoUpload(path)
                            .then(isDone => {
                            uploadStopped = isDone;
                            return lockfile.Unlock(this.en.FILE_SYNC_LOCK);
                        })
                            .catch(() => {
                            uploadStopped = true;
                            return lockfile.Unlock(this.en.FILE_SYNC_LOCK);
                        });
                    }
                }
                else {
                    uploadStopped = true;
                    yield lockfile.Unlock(this.en.FILE_SYNC_LOCK);
                }
            }));
        });
    }
    InitiateAutoUpload(path) {
        return __awaiter(this, void 0, void 0, function* () {
            vscode.window.setStatusBarMessage("").dispose();
            vscode.window.setStatusBarMessage(localize_1.default("common.info.initAutoUpload"), 5000);
            yield util_1.Util.Sleep(3000);
            vscode.commands.executeCommand("extension.updateSettings", "forceUpdate", path);
            return true;
        });
    }
    CloseWatch() {
        if (Commons.configWatcher != null) {
            Commons.configWatcher.close();
        }
        if (Commons.extensionWatcher != null) {
            Commons.extensionWatcher.close();
        }
    }
    InitalizeSettings(askToken, askGist) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = new setting_1.LocalConfig();
            const extSettings = this.GetSettings();
            const cusSettings = yield this.GetCustomSettings();
            if (cusSettings.token === "") {
                if (askToken === true) {
                    askToken = !cusSettings.downloadPublicGist;
                }
                if (askToken) {
                    if (cusSettings.openTokenLink) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://github.com/settings/tokens"));
                    }
                    const tokTemp = yield this.GetTokenAndSave(cusSettings);
                    if (!tokTemp) {
                        const msg = localize_1.default("common.error.tokenNotSave");
                        vscode.window.showErrorMessage(msg);
                        throw new Error(msg);
                    }
                    cusSettings.token = tokTemp;
                }
            }
            if (extSettings.gist === "") {
                if (askGist) {
                    const gistTemp = yield this.GetGistAndSave(extSettings);
                    if (!gistTemp) {
                        const msg = localize_1.default("common.error.gistNotSave");
                        vscode.window.showErrorMessage(msg);
                        throw new Error(msg);
                    }
                    extSettings.gist = gistTemp;
                }
            }
            settings.customConfig = cusSettings;
            settings.extConfig = extSettings;
            return settings;
        });
    }
    GetCustomSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            let customSettings = new setting_1.CustomSettings();
            try {
                const customExist = yield fileService_1.FileService.FileExists(this.en.FILE_CUSTOMIZEDSETTINGS);
                if (customExist) {
                    const customSettingStr = yield fileService_1.FileService.ReadFile(this.en.FILE_CUSTOMIZEDSETTINGS);
                    const tempObj = JSON.parse(customSettingStr);
                    if (!Array.isArray(tempObj.ignoreUploadSettings)) {
                        tempObj.ignoreUploadSettings = [];
                    }
                    Object.assign(customSettings, tempObj);
                    customSettings.token = customSettings.token.trim();
                    return customSettings;
                }
            }
            catch (e) {
                Commons.LogException(e, "Sync : Unable to read " +
                    this.en.FILE_CUSTOMIZEDSETTINGS_NAME +
                    ". Make sure its Valid JSON.", true);
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("http://shanalikhan.github.io/2017/02/19/Option-to-ignore-settings-folders-code-settings-sync.html"));
                customSettings = null;
                return customSettings;
            }
        });
    }
    SetCustomSettings(setting) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const json = Object.assign({}, setting);
                delete json.ignoreUploadSettings;
                yield fileService_1.FileService.WriteFile(this.en.FILE_CUSTOMIZEDSETTINGS, JSON.stringify(json));
                return true;
            }
            catch (e) {
                Commons.LogException(e, "Sync : Unable to write " + this.en.FILE_CUSTOMIZEDSETTINGS_NAME, true);
                return false;
            }
        });
    }
    StartMigrationProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExist = yield fileService_1.FileService.FileExists(this.en.FILE_CUSTOMIZEDSETTINGS);
            let customSettings = null;
            const firstTime = !fileExist;
            let fileChanged = firstTime;
            if (fileExist) {
                customSettings = yield this.GetCustomSettings();
            }
            else {
                customSettings = new setting_1.CustomSettings();
            }
            // vscode.workspace.getConfiguration().update("sync.version", undefined, true);
            if (firstTime) {
                const openExtensionPage = localize_1.default("common.action.openExtPage");
                const openExtensionTutorial = localize_1.default("common.action.openExtTutorial");
                vscode.window.showInformationMessage(localize_1.default("common.info.installed"));
                vscode.window
                    .showInformationMessage(localize_1.default("common.info.needHelp"), openExtensionPage)
                    .then((val) => {
                    if (val === openExtensionPage) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync"));
                    }
                });
                vscode.window
                    .showInformationMessage(localize_1.default("common.info.excludeFile"), openExtensionTutorial)
                    .then((val) => {
                    if (val === openExtensionTutorial) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://shanalikhan.github.io/2016/07/31/Visual-Studio-code-sync-setting-edit-manually.html"));
                    }
                });
            }
            else if (customSettings.version < environmentPath_1.Environment.CURRENT_VERSION) {
                fileChanged = true;
                if (this.context.globalState.get("synctoken")) {
                    const token = this.context.globalState.get("synctoken");
                    if (token !== "") {
                        customSettings.token = String(token);
                        this.context.globalState.update("synctoken", "");
                        vscode.window.showInformationMessage(localize_1.default("common.info.setToken"));
                    }
                }
                const releaseNotes = localize_1.default("common.action.releaseNotes");
                const writeReview = localize_1.default("common.action.writeReview");
                const support = localize_1.default("common.action.support");
                const joinCommunity = localize_1.default("common.action.joinCommunity");
                // TODO : Remove this, v3.1 Specific only.
                vscode.window.showInformationMessage("Some Settings are updated. You can remove unnecessary sync settings from code. Read Sync guide for details.");
                vscode.window
                    .showInformationMessage(localize_1.default("common.info.updateTo", environmentPath_1.Environment.getVersion()), releaseNotes, writeReview, support, joinCommunity)
                    .then((val) => {
                    if (val === releaseNotes) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("http://shanalikhan.github.io/2016/05/14/Visual-studio-code-sync-settings-release-notes.html"));
                    }
                    if (val === writeReview) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync#review-details"));
                    }
                    if (val === support) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP-DonationsBF:btn_donate_SM.gif:NonHosted"));
                    }
                    if (val === joinCommunity) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://join.slack.com/t/codesettingssync/shared_invite/enQtMzE3MjY5NTczNDMwLTYwMTIwNGExOGE2MTJkZWU0OTU5MmI3ZTc4N2JkZjhjMzY1OTk5OGExZjkwMDMzMDU4ZTBlYjk5MGQwZmMyNzk"));
                    }
                });
            }
            if (fileChanged) {
                customSettings.version = environmentPath_1.Environment.CURRENT_VERSION;
                yield this.SetCustomSettings(customSettings);
            }
            return true;
        });
    }
    SaveSettings(setting) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode.workspace.getConfiguration("sync");
            const allKeysUpdated = new Array();
            const keys = Object.keys(setting);
            keys.forEach((keyName) => __awaiter(this, void 0, void 0, function* () {
                if (setting[keyName] == null) {
                    setting[keyName] = "";
                }
                if (keyName.toLowerCase() !== "token") {
                    allKeysUpdated.push(config.update(keyName, setting[keyName], true));
                }
            }));
            try {
                yield Promise.all(allKeysUpdated);
                if (this.context.globalState.get("syncCounter")) {
                    const counter = this.context.globalState.get("syncCounter");
                    let count = parseInt(counter + "", 10);
                    if (count % 450 === 0) {
                        this.DonateMessage();
                    }
                    count = count + 1;
                    this.context.globalState.update("syncCounter", count);
                }
                else {
                    this.context.globalState.update("syncCounter", 1);
                }
                return true;
            }
            catch (err) {
                Commons.LogException(err, this.ERROR_MESSAGE, true);
                return false;
            }
        });
    }
    DonateMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const donateNow = localize_1.default("common.action.donate");
            const writeReview = localize_1.default("common.action.writeReview");
            const res = yield vscode.window.showInformationMessage(localize_1.default("common.info.donate"), donateNow, writeReview);
            if (res === donateNow) {
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP-DonationsBF:btn_donate_SM.gif:NonHosted"));
            }
            else if (res === writeReview) {
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync#review-details"));
            }
        });
    }
    GetSettings() {
        const settings = new setting_1.ExtensionConfig();
        for (const key of Object.keys(settings)) {
            if (key !== "token") {
                settings[key] = vscode.workspace.getConfiguration("sync").get(key);
            }
        }
        settings.gist = settings.gist.trim();
        return settings;
    }
    GetTokenAndSave(sett) {
        return __awaiter(this, void 0, void 0, function* () {
            const opt = Commons.GetInputBox(true);
            const token = ((yield vscode.window.showInputBox(opt)) || "").trim();
            if (token && token !== "esc") {
                sett.token = token;
                const saved = yield this.SetCustomSettings(sett);
                if (saved) {
                    vscode.window.setStatusBarMessage(localize_1.default("common.info.tokenSaved"), 1000);
                }
            }
            return token;
        });
    }
    GetGistAndSave(sett) {
        return __awaiter(this, void 0, void 0, function* () {
            const opt = Commons.GetInputBox(false);
            const gist = ((yield vscode.window.showInputBox(opt)) || "").trim();
            if (gist && gist !== "esc") {
                sett.gist = gist;
                const saved = yield this.SaveSettings(sett);
                if (saved) {
                    vscode.window.setStatusBarMessage(localize_1.default("common.info.gistSaved"), 1000);
                }
                return gist;
            }
        });
    }
    /**
     * IgnoreSettings
     */
    GetIgnoredSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignoreSettings = {};
            const config = vscode.workspace.getConfiguration();
            const keysUpdated = [];
            for (const key of settings) {
                let keyValue = null;
                keyValue = config.get(key, null);
                if (keyValue !== null) {
                    ignoreSettings[key] = keyValue;
                    keysUpdated.push(config.update(key, undefined, true));
                }
            }
            yield Promise.all(keysUpdated);
            return ignoreSettings;
        });
    }
    /**
     * RestoreIgnoredSettings
     */
    SetIgnoredSettings(ignoredSettings) {
        const config = vscode.workspace.getConfiguration();
        const keysUpdated = [];
        for (const key of Object.keys(ignoredSettings)) {
            keysUpdated.push(config.update(key, ignoredSettings[key], true));
        }
    }
    /**
     * AskGistName
     */
    AskGistName() {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.showInputBox({
                prompt: localize_1.default("common.prompt.multipleGist"),
                ignoreFocusOut: true,
                placeHolder: localize_1.default("common.placeholder.multipleGist")
            });
        });
    }
    ShowSummaryOutput(upload, files, removedExtensions, addedExtensions, ignoredExtensions, syncSettings) {
        if (Commons.outputChannel === null) {
            Commons.outputChannel = vscode.window.createOutputChannel("Code Settings Sync");
        }
        const outputChannel = Commons.outputChannel;
        outputChannel.clear();
        outputChannel.appendLine(`CODE SETTINGS SYNC ${upload ? "UPLOAD" : "DOWNLOAD"} SUMMARY`);
        outputChannel.appendLine(`Version: ${environmentPath_1.Environment.getVersion()}`);
        outputChannel.appendLine(`--------------------`);
        outputChannel.appendLine(`GitHub Token: ${syncSettings.customConfig.token || "Anonymous"}`);
        outputChannel.appendLine(`GitHub Gist: ${syncSettings.extConfig.gist}`);
        outputChannel.appendLine(`GitHub Gist Type: ${syncSettings.publicGist ? "Public" : "Secret"}`);
        outputChannel.appendLine(``);
        if (!syncSettings.customConfig.token) {
            outputChannel.appendLine(`Anonymous Gist cannot be edited, the extension will always create a new one during upload.`);
        }
        outputChannel.appendLine(`Restarting Visual Studio Code may be required to apply color and file icon theme.`);
        outputChannel.appendLine(`--------------------`);
        outputChannel.appendLine(`Files ${upload ? "Upload" : "Download"}ed:`);
        files.filter(item => item.fileName.indexOf(".") > 0).forEach(item => {
            outputChannel.appendLine(`  ${item.fileName} > ${item.gistName}`);
        });
        outputChannel.appendLine(``);
        outputChannel.appendLine(`Extensions Ignored:`);
        if (!ignoredExtensions || ignoredExtensions.length === 0) {
            outputChannel.appendLine(`  No extensions ignored.`);
        }
        else {
            ignoredExtensions.forEach(extn => {
                outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
            });
        }
        outputChannel.appendLine(``);
        outputChannel.appendLine(`Extensions Removed:`);
        if (!syncSettings.extConfig.removeExtensions) {
            outputChannel.appendLine(`  Feature Disabled.`);
        }
        else {
            if (!removedExtensions || removedExtensions.length === 0) {
                outputChannel.appendLine(`  No extensions removed.`);
            }
            else {
                removedExtensions.forEach(extn => {
                    outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
                });
            }
        }
        if (addedExtensions) {
            outputChannel.appendLine(``);
            outputChannel.appendLine(`Extensions Added:`);
            if (addedExtensions.length === 0) {
                outputChannel.appendLine(`  No extensions installed.`);
            }
            addedExtensions.forEach(extn => {
                outputChannel.appendLine(`  ${extn.name} v${extn.version}`);
            });
        }
        outputChannel.appendLine(`--------------------`);
        outputChannel.append(`Done.`);
        outputChannel.show(true);
    }
}
Commons.configWatcher = null;
Commons.extensionWatcher = null;
Commons.outputChannel = null;
exports.default = Commons;
//# sourceMappingURL=commons.js.map