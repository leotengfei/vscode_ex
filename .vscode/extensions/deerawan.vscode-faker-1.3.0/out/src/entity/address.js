"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Address = /** @class */ (function () {
    function Address() {
    }
    Address.prototype.getName = function () {
        return 'address';
    };
    Address.prototype.getMethods = function () {
        return [
            'zipCode',
            'city',
            'cityPrefix',
            'citySuffix',
            'streetName',
            'streetAddress',
            'streetSuffix',
            'streetPrefix',
            'secondaryAddress',
            'county',
            'country',
            'countryCode',
            'state',
            'stateAbbr',
            'latitude',
            'longitude',
        ];
    };
    return Address;
}());
exports.Address = Address;
//# sourceMappingURL=address.js.map