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
const GitHubApi = require("@octokit/rest");
const HttpsProxyAgent = require("https-proxy-agent");
const vscode = require("vscode");
class GitHubService {
    constructor(userToken, basePath) {
        this.userName = null;
        this.name = null;
        this.github = null;
        this.GIST_JSON_EMPTY = {
            description: "Visual Studio Code Sync Settings Gist",
            public: false,
            files: {
                "settings.json": {
                    content: "// Empty"
                },
                "launch.json": {
                    content: "// Empty"
                },
                "keybindings.json": {
                    content: "// Empty"
                },
                "extensions.json": {
                    content: "// Empty"
                },
                "locale.json": {
                    content: "// Empty"
                },
                "keybindingsMac.json": {
                    content: "// Empty"
                },
                cloudSettings: {
                    content: "// Empty"
                }
            }
        };
        const githubApiConfig = {
            headers: {
                rejectUnauthorized: false
            }
        };
        const proxyURL = vscode.workspace.getConfiguration("http").get("proxy") ||
            process.env.http_proxy ||
            process.env.HTTP_PROXY;
        if (basePath) {
            githubApiConfig.baseUrl = basePath;
        }
        if (proxyURL) {
            githubApiConfig.agent = new HttpsProxyAgent(proxyURL);
        }
        this.github = new GitHubApi(githubApiConfig);
        if (userToken !== null && userToken !== "") {
            try {
                this.github.authenticate({
                    type: "oauth",
                    token: userToken
                });
            }
            catch (err) {
                console.error(err);
            }
            this.github.users
                .get({})
                .then(res => {
                this.userName = res.data.login;
                this.name = res.data.name;
                console.log("Sync : Connected with user : " + "'" + this.userName + "'");
            })
                .catch(err => {
                console.error(err);
            });
        }
    }
    AddFile(list, GIST_JSON_B) {
        for (const file of list) {
            if (file.content !== "") {
                GIST_JSON_B.files[file.gistName] = {};
                GIST_JSON_B.files[file.gistName].content = file.content;
            }
        }
        return GIST_JSON_B;
    }
    CreateEmptyGIST(publicGist, gistDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            if (publicGist) {
                this.GIST_JSON_EMPTY.public = true;
            }
            else {
                this.GIST_JSON_EMPTY.public = false;
            }
            if (gistDescription !== null && gistDescription !== "") {
                this.GIST_JSON_EMPTY.description = gistDescription;
            }
            try {
                const res = yield this.github.gists.create(this.GIST_JSON_EMPTY);
                if (res.data && res.data.id) {
                    return res.data.id.toString();
                }
                else {
                    console.error("ID is null");
                    console.log("Sync : " + "Response from GitHub is: ");
                    console.log(res);
                }
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    ReadGist(GIST) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.github.gists.get({ gist_id: GIST });
        });
    }
    UpdateGIST(gistObject, files) {
        const allFiles = Object.keys(gistObject.data.files);
        for (const fileName of allFiles) {
            let exists = false;
            for (const settingFile of files) {
                if (settingFile.gistName === fileName) {
                    exists = true;
                }
            }
            if (!exists && !fileName.startsWith("keybindings")) {
                gistObject.data.files[fileName] = null;
            }
        }
        gistObject.data = this.AddFile(files, gistObject.data);
        return gistObject;
    }
    SaveGIST(gistObject) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.github.gists.edit(gistObject);
            return true;
        });
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=githubService.js.map