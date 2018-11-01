"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const enums_1 = require("./enums");
class Environment {
    constructor(context) {
        this.context = context;
        this.isInsiders = false;
        this.isOss = false;
        this.homeDir = null;
        this.USER_FOLDER = null;
        this.ExtensionFolder = null;
        this.PATH = null;
        this.OsType = null;
        this.FILE_SETTING = null;
        this.FILE_LAUNCH = null;
        this.FILE_KEYBINDING = null;
        this.FILE_LOCALE = null;
        this.FILE_EXTENSION = null;
        this.FILE_CLOUDSETTINGS = null;
        this.FILE_SYNC_LOCK = null;
        this.FILE_CUSTOMIZEDSETTINGS_NAME = "syncLocalSettings.json";
        this.FILE_CUSTOMIZEDSETTINGS = null;
        this.FILE_SETTING_NAME = "settings.json";
        this.FILE_LAUNCH_NAME = "launch.json";
        this.FILE_KEYBINDING_NAME = "keybindings.json";
        this.FILE_KEYBINDING_MAC = "keybindingsMac.json";
        this.FILE_KEYBINDING_DEFAULT = "keybindings.json";
        this.FILE_EXTENSION_NAME = "extensions.json";
        this.FILE_LOCALE_NAME = "locale.json";
        this.FILE_SYNC_LOCK_NAME = "sync.lock";
        this.FILE_CLOUDSETTINGS_NAME = "cloudSettings";
        this.FOLDER_SNIPPETS = null;
        this.APP_SUMMARY_NAME = "syncSummary.txt";
        this.APP_SUMMARY = null;
        this.isInsiders = /insiders/.test(this.context.asAbsolutePath(""));
        this.isOss = /\boss\b/.test(this.context.asAbsolutePath(""));
        const isXdg = !this.isInsiders &&
            !!this.isOss &&
            process.platform === "linux" &&
            !!process.env.XDG_DATA_HOME;
        this.homeDir = isXdg
            ? process.env.XDG_DATA_HOME
            : process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
        const configSuffix = `${isXdg ? "" : "."}vscode${this.isInsiders ? "-insiders" : this.isOss ? "-oss" : ""}`;
        this.ExtensionFolder = path.join(this.homeDir, configSuffix, "extensions");
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        this.PATH = process.env.APPDATA;
        this.OsType = enums_1.OsType.Windows;
        if (!this.PATH) {
            if (process.platform === "darwin") {
                this.PATH = process.env.HOME + "/Library/Application Support";
                this.OsType = enums_1.OsType.Mac;
            }
            else if (process.platform === "linux") {
                this.PATH =
                    isXdg && !!process.env.XDG_CONFIG_HOME
                        ? process.env.XDG_CONFIG_HOME
                        : os.homedir() + "/.config";
                this.OsType = enums_1.OsType.Linux;
            }
            else {
                this.PATH = "/var/local";
                this.OsType = enums_1.OsType.Linux;
            }
        }
        if (this.OsType === enums_1.OsType.Linux) {
            const myExt = "chmod +x " +
                this.ExtensionFolder +
                "/Shan.code-settings-sync-" +
                Environment.getVersion() +
                "/node_modules/opn/xdg-open";
            child_process_1.exec(myExt, () => {
                // command output is in stdout
            });
        }
        const possibleCodePaths = [
            this.isInsiders
                ? "/Code - Insiders"
                : this.isOss
                    ? "/Code - OSS"
                    : "/Code"
        ];
        for (const possibleCodePath of possibleCodePaths) {
            try {
                fs.statSync(this.PATH + possibleCodePath);
                this.PATH = this.PATH + possibleCodePath;
                break;
            }
            catch (e) {
                console.error("Error :" + possibleCodePath);
                console.error(e);
            }
        }
        this.USER_FOLDER = this.PATH.concat("/User/");
        this.FILE_EXTENSION = this.PATH.concat("/User/", this.FILE_EXTENSION_NAME);
        this.FILE_SETTING = this.PATH.concat("/User/", this.FILE_SETTING_NAME);
        this.FILE_LAUNCH = this.PATH.concat("/User/", this.FILE_LAUNCH_NAME);
        this.FILE_KEYBINDING = this.PATH.concat("/User/", this.FILE_KEYBINDING_NAME);
        this.FILE_LOCALE = this.PATH.concat("/User/", this.FILE_LOCALE_NAME);
        this.FOLDER_SNIPPETS = this.PATH.concat("/User/snippets/");
        this.APP_SUMMARY = this.PATH.concat("/User/", this.APP_SUMMARY_NAME);
        this.FILE_CLOUDSETTINGS = this.PATH.concat("/User/", this.FILE_CLOUDSETTINGS_NAME);
        this.FILE_CUSTOMIZEDSETTINGS = this.PATH.concat("/User/", this.FILE_CUSTOMIZEDSETTINGS_NAME);
        this.FILE_SYNC_LOCK = this.PATH.concat("/User/", this.FILE_SYNC_LOCK_NAME);
    }
    static getVersion() {
        return (Environment.CURRENT_VERSION.toString().slice(0, 1) +
            "." +
            Environment.CURRENT_VERSION.toString().slice(1, 2) +
            "." +
            Environment.CURRENT_VERSION.toString().slice(2, 3));
    }
}
Environment.CURRENT_VERSION = 312;
exports.Environment = Environment;
//# sourceMappingURL=environmentPath.js.map