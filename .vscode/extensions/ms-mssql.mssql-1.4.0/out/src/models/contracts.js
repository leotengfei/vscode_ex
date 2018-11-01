"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// --------------------------------- < Version Request > -------------------------------------------------
// Version request message callback declaration
var VersionRequest;
(function (VersionRequest) {
    VersionRequest.type = { get method() { return 'version'; } };
})(VersionRequest = exports.VersionRequest || (exports.VersionRequest = {}));
// ------------------------------- </ Version Request > --------------------------------------------------
// --------------------------------- < Read Credential Request > -------------------------------------------------
// Read Credential request message callback declaration
var ReadCredentialRequest;
(function (ReadCredentialRequest) {
    ReadCredentialRequest.type = { get method() { return 'credential/read'; } };
})(ReadCredentialRequest = exports.ReadCredentialRequest || (exports.ReadCredentialRequest = {}));
/**
 * Parameters to initialize a connection to a database
 */
class Credential {
}
exports.Credential = Credential;
// --------------------------------- </ Read Credential Request > -------------------------------------------------
// --------------------------------- < Save Credential Request > -------------------------------------------------
// Save Credential request message callback declaration
var SaveCredentialRequest;
(function (SaveCredentialRequest) {
    SaveCredentialRequest.type = { get method() { return 'credential/save'; } };
})(SaveCredentialRequest = exports.SaveCredentialRequest || (exports.SaveCredentialRequest = {}));
// --------------------------------- </ Save Credential Request > -------------------------------------------------
// --------------------------------- < Delete Credential Request > -------------------------------------------------
// Delete Credential request message callback declaration
var DeleteCredentialRequest;
(function (DeleteCredentialRequest) {
    DeleteCredentialRequest.type = { get method() { return 'credential/delete'; } };
})(DeleteCredentialRequest = exports.DeleteCredentialRequest || (exports.DeleteCredentialRequest = {}));
// --------------------------------- </ Delete Credential Request > -------------------------------------------------
class SaveResultsRequestParams {
}
exports.SaveResultsRequestParams = SaveResultsRequestParams;
class SaveResultsAsCsvRequestParams extends SaveResultsRequestParams {
    constructor() {
        super(...arguments);
        this.includeHeaders = true;
    }
}
exports.SaveResultsAsCsvRequestParams = SaveResultsAsCsvRequestParams;
class SaveResultsAsJsonRequestParams extends SaveResultsRequestParams {
}
exports.SaveResultsAsJsonRequestParams = SaveResultsAsJsonRequestParams;
class SaveResultsAsExcelRequestParams extends SaveResultsRequestParams {
    constructor() {
        super(...arguments);
        this.includeHeaders = true;
    }
}
exports.SaveResultsAsExcelRequestParams = SaveResultsAsExcelRequestParams;
class SaveResultRequestResult {
}
exports.SaveResultRequestResult = SaveResultRequestResult;
// --------------------------------- < Save Results as CSV Request > ------------------------------------------
// save results in csv format
var SaveResultsAsCsvRequest;
(function (SaveResultsAsCsvRequest) {
    SaveResultsAsCsvRequest.type = { get method() { return 'query/saveCsv'; } };
})(SaveResultsAsCsvRequest = exports.SaveResultsAsCsvRequest || (exports.SaveResultsAsCsvRequest = {}));
// --------------------------------- </ Save Results as CSV Request > ------------------------------------------
// --------------------------------- < Save Results as JSON Request > ------------------------------------------
// save results in json format
var SaveResultsAsJsonRequest;
(function (SaveResultsAsJsonRequest) {
    SaveResultsAsJsonRequest.type = { get method() { return 'query/saveJson'; } };
})(SaveResultsAsJsonRequest = exports.SaveResultsAsJsonRequest || (exports.SaveResultsAsJsonRequest = {}));
// --------------------------------- </ Save Results as JSON Request > ------------------------------------------
// --------------------------------- < Save Results as Excel Request > ------------------------------------------
// save results in Excel format
var SaveResultsAsExcelRequest;
(function (SaveResultsAsExcelRequest) {
    SaveResultsAsExcelRequest.type = { get method() { return 'query/saveExcel'; } };
})(SaveResultsAsExcelRequest = exports.SaveResultsAsExcelRequest || (exports.SaveResultsAsExcelRequest = {}));
// --------------------------------- </ Save Results as Excel Request > ------------------------------------------

//# sourceMappingURL=contracts.js.map
