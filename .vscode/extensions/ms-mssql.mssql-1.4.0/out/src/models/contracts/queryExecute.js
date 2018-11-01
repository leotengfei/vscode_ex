"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResultSetSummary {
}
exports.ResultSetSummary = ResultSetSummary;
class BatchSummary {
}
exports.BatchSummary = BatchSummary;
// Query Execution Complete Notification ----------------------------------------------------------
var QueryExecuteCompleteNotification;
(function (QueryExecuteCompleteNotification) {
    QueryExecuteCompleteNotification.type = {
        get method() {
            return 'query/complete';
        }
    };
})(QueryExecuteCompleteNotification = exports.QueryExecuteCompleteNotification || (exports.QueryExecuteCompleteNotification = {}));
class QueryExecuteCompleteNotificationResult {
}
exports.QueryExecuteCompleteNotificationResult = QueryExecuteCompleteNotificationResult;
// Query Batch Notification -----------------------------------------------------------------------
class QueryExecuteBatchNotificationParams {
}
exports.QueryExecuteBatchNotificationParams = QueryExecuteBatchNotificationParams;
// Query Batch Start Notification -----------------------------------------------------------------
var QueryExecuteBatchStartNotification;
(function (QueryExecuteBatchStartNotification) {
    QueryExecuteBatchStartNotification.type = {
        get method() {
            return 'query/batchStart';
        }
    };
})(QueryExecuteBatchStartNotification = exports.QueryExecuteBatchStartNotification || (exports.QueryExecuteBatchStartNotification = {}));
// Query Batch Complete Notification --------------------------------------------------------------
var QueryExecuteBatchCompleteNotification;
(function (QueryExecuteBatchCompleteNotification) {
    QueryExecuteBatchCompleteNotification.type = {
        get method() {
            return 'query/batchComplete';
        }
    };
})(QueryExecuteBatchCompleteNotification = exports.QueryExecuteBatchCompleteNotification || (exports.QueryExecuteBatchCompleteNotification = {}));
// Query ResultSet Complete Notification -----------------------------------------------------------
var QueryExecuteResultSetCompleteNotification;
(function (QueryExecuteResultSetCompleteNotification) {
    QueryExecuteResultSetCompleteNotification.type = {
        get method() {
            return 'query/resultSetComplete';
        }
    };
})(QueryExecuteResultSetCompleteNotification = exports.QueryExecuteResultSetCompleteNotification || (exports.QueryExecuteResultSetCompleteNotification = {}));
class QueryExecuteResultSetCompleteNotificationParams {
}
exports.QueryExecuteResultSetCompleteNotificationParams = QueryExecuteResultSetCompleteNotificationParams;
// Query Message Notification ---------------------------------------------------------------------
var QueryExecuteMessageNotification;
(function (QueryExecuteMessageNotification) {
    QueryExecuteMessageNotification.type = {
        get method() {
            return 'query/message';
        }
    };
})(QueryExecuteMessageNotification = exports.QueryExecuteMessageNotification || (exports.QueryExecuteMessageNotification = {}));
class QueryExecuteMessageParams {
}
exports.QueryExecuteMessageParams = QueryExecuteMessageParams;
// Query Execution Request ------------------------------------------------------------------------
var QueryExecuteRequest;
(function (QueryExecuteRequest) {
    QueryExecuteRequest.type = {
        get method() {
            return 'query/executeDocumentSelection';
        }
    };
})(QueryExecuteRequest = exports.QueryExecuteRequest || (exports.QueryExecuteRequest = {}));
var QueryExecuteStatementRequest;
(function (QueryExecuteStatementRequest) {
    QueryExecuteStatementRequest.type = {
        get method() {
            return 'query/executedocumentstatement';
        }
    };
})(QueryExecuteStatementRequest = exports.QueryExecuteStatementRequest || (exports.QueryExecuteStatementRequest = {}));
class QueryExecuteParams {
}
exports.QueryExecuteParams = QueryExecuteParams;
class QueryExecuteStatementParams {
}
exports.QueryExecuteStatementParams = QueryExecuteStatementParams;
class QueryExecuteResult {
}
exports.QueryExecuteResult = QueryExecuteResult;
// --------------------------------- < Query Results Request > ------------------------------------------
var QueryExecuteSubsetRequest;
(function (QueryExecuteSubsetRequest) {
    QueryExecuteSubsetRequest.type = {
        get method() {
            return 'query/subset';
        }
    };
})(QueryExecuteSubsetRequest = exports.QueryExecuteSubsetRequest || (exports.QueryExecuteSubsetRequest = {}));
class QueryExecuteSubsetParams {
}
exports.QueryExecuteSubsetParams = QueryExecuteSubsetParams;
class DbCellValue {
}
exports.DbCellValue = DbCellValue;
class ResultSetSubset {
}
exports.ResultSetSubset = ResultSetSubset;
class QueryExecuteSubsetResult {
}
exports.QueryExecuteSubsetResult = QueryExecuteSubsetResult;
// --------------------------------- </ Query Results Request > ------------------------------------------

//# sourceMappingURL=queryExecute.js.map
