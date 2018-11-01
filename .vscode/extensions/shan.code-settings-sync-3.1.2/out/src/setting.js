"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environmentPath_1 = require("./environmentPath");
class ExtensionConfig {
    constructor() {
        this.gist = null;
        this.quietSync = false;
        this.removeExtensions = true;
        this.syncExtensions = true;
        this.autoDownload = false;
        this.autoUpload = false;
        this.forceDownload = false;
    }
}
exports.ExtensionConfig = ExtensionConfig;
class LocalConfig {
    constructor() {
        this.publicGist = false;
        this.userName = null;
        this.name = null;
        this.extConfig = new ExtensionConfig();
        this.customConfig = new CustomSettings();
    }
}
exports.LocalConfig = LocalConfig;
class CloudSetting {
    constructor() {
        this.lastUpload = null;
        this.extensionVersion = "v" + environmentPath_1.Environment.getVersion();
    }
}
exports.CloudSetting = CloudSetting;
class KeyValue {
    constructor(Key, Value) {
        this.Key = Key;
        this.Value = Value;
    }
}
exports.KeyValue = KeyValue;
class CustomSettings {
    constructor() {
        this.ignoreUploadFiles = [
            "projects.json",
            "projects_cache_vscode.json",
            "projects_cache_git.json",
            "projects_cache_svn.json",
            "gpm_projects.json",
            "gpm-recentItems.json"
        ];
        this.ignoreUploadFolders = ["workspaceStorage"];
        this.ignoreExtensions = [];
        this.ignoreUploadSettings = [];
        this.replaceCodeSettings = {};
        this.gistDescription = "Visual Studio Code Settings Sync Gist";
        this.version = environmentPath_1.Environment.CURRENT_VERSION;
        this.token = "";
        this.downloadPublicGist = false;
        this.supportedFileExtensions = ["json", "code-snippets"];
        this.openTokenLink = true;
        this.useCliBaseInstallation = true;
        this.lastUpload = null;
        this.lastDownload = null;
        this.githubEnterpriseUrl = null;
        this.askGistName = false;
    }
}
exports.CustomSettings = CustomSettings;
//# sourceMappingURL=setting.js.map