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
class File {
    constructor(fileName, content, filePath, gistName) {
        this.fileName = fileName;
        this.content = content;
        this.filePath = filePath;
        this.gistName = gistName;
    }
}
exports.File = File;
class FileService {
    static ReadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs.readFile(filePath, { encoding: "utf8" });
                return data;
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    static IsDirectory(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stat = yield fs.lstat(filepath);
                return stat.isDirectory();
            }
            catch (err) {
                return false;
            }
        });
    }
    static GetFile(filePath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExists = yield FileService.FileExists(filePath);
            if (!fileExists) {
                return null;
            }
            const content = yield FileService.ReadFile(filePath);
            if (content === null) {
                return null;
            }
            const pathFromUser = filePath.substring(filePath.lastIndexOf("User") + 5, filePath.length);
            const arr = pathFromUser.indexOf("/")
                ? pathFromUser.split("/")
                : pathFromUser.split(path.sep);
            let gistName = "";
            arr.forEach((element, index) => {
                if (index < arr.length - 1) {
                    gistName += element + "|";
                }
                else {
                    gistName += element;
                }
            });
            const file = new File(fileName, content, filePath, gistName);
            return file;
        });
    }
    static WriteFile(filePath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data) {
                console.error(new Error("Unable to write file. FilePath :" + filePath + " Data :" + data));
                return false;
            }
            try {
                yield fs.writeFile(filePath, data);
                return true;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        });
    }
    static ListFiles(directory, depth, fullDepth, fileExtensions) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileList = yield fs.readdir(directory);
            const files = [];
            for (const fileName of fileList) {
                const fullPath = directory.concat(fileName);
                if (yield FileService.IsDirectory(fullPath)) {
                    if (depth < fullDepth) {
                        for (const element of yield FileService.ListFiles(fullPath + "/", depth + 1, fullDepth, fileExtensions)) {
                            files.push(element);
                        }
                    }
                }
                else {
                    const hasExtension = fullPath.lastIndexOf(".") > 0;
                    let allowedFile = false;
                    if (hasExtension) {
                        const extension = fullPath
                            .substr(fullPath.lastIndexOf(".") + 1, fullPath.length)
                            .toLowerCase();
                        allowedFile = fileExtensions.filter(m => m === extension).length > 0;
                    }
                    else {
                        allowedFile = fileExtensions.filter(m => m === "").length > 0;
                    }
                    if (allowedFile) {
                        const file = yield FileService.GetFile(fullPath, fileName);
                        files.push(file);
                    }
                }
            }
            return files;
        });
    }
    static CreateDirTree(userFolder, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullPath = userFolder;
            let result;
            if (fileName.indexOf("|") > -1) {
                const paths = fileName.split("|");
                for (let i = 0; i < paths.length - 1; i++) {
                    const element = paths[i];
                    fullPath += element + "/";
                    yield FileService.CreateDirectory(fullPath);
                }
                result = fullPath + paths[paths.length - 1];
                return result;
            }
            else {
                result = fullPath + fileName;
                return result;
            }
        });
    }
    static DeleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stat = yield FileService.FileExists(filePath);
                if (stat) {
                    yield fs.unlink(filePath);
                }
                return true;
            }
            catch (err) {
                console.error("Unable to delete file. File Path is :" + filePath);
                return false;
            }
        });
    }
    static FileExists(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.access(filePath, fs.constants.F_OK);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    static CreateDirectory(name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.mkdir(name);
                return true;
            }
            catch (err) {
                if (err.code === "EEXIST") {
                    return false;
                }
                throw err;
            }
        });
    }
}
exports.FileService = FileService;
//# sourceMappingURL=fileService.js.map