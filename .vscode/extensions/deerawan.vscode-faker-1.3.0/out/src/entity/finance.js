"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Finance = /** @class */ (function () {
    function Finance() {
    }
    Finance.prototype.getName = function () {
        return 'finance';
    };
    Finance.prototype.getMethods = function () {
        return [
            'account',
            'accountName',
            'mask',
            'amount',
            'transactionType',
            'currencyCode',
            'currencyName',
            'currencySymbol',
            'bitcoinAddress',
            'iban',
            'bic',
        ];
    };
    return Finance;
}());
exports.Finance = Finance;
//# sourceMappingURL=finance.js.map