const legacyCustomerModel = require("./legacy/customer");
const modernCustomerModel = require("./modern/customer");
const legacyOrderModel = require("./legacy/order");
const modernOrderModel = require("./modern/order");
const legacyProductModel = require("./legacy/product");
const modernProductModel = require("./modern/product");

const SynchronisationEntry = require("./synchronizationEntry");

let tablesByName = null;
let tablesByLegacyName = null;
let tablesByModernName = null;

const synchronization = {
    tables:  [
        new SynchronisationEntry('customers', legacyCustomerModel, modernCustomerModel),
        new SynchronisationEntry('products', legacyProductModel, modernProductModel),
        new SynchronisationEntry('orders', legacyOrderModel, modernOrderModel, { purchaser: 'customers', productId: 'products' }),
    ],

    getTablesByName: () => {
        if (tablesByName === null) {
            tablesByName = {};
            synchronization.tables.forEach((value) => {
                tablesByName[value.name] = value;
            })
        }
        return tablesByName;
    },

    getTablesByLegacyName: (tablePrefix) => {
        if (tablesByLegacyName === null) {
            tablesByLegacyName = {};
            synchronization.tables.forEach((value) => {
                tablesByLegacyName[tablePrefix + value.legacyModel.tableName] = value;
            })
        }
        return tablesByLegacyName;
    },

    getTablesByModernName: (tablePrefix) => {
        if (tablesByModernName === null) {
            tablesByModernName = {};
            synchronization.tables.forEach((value) => {
                tablesByModernName[tablePrefix + value.modernModel.tableName] = value;
            })
        }
        return tablesByModernName;
    }
}

module.exports = synchronization;
