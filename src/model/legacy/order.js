const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Order = {
    tableName: "legacy_bestellungen",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        orderDate: new TableField("bestellung_datum", FieldTypes.Date),
        purchaser: new TableField("kunde_id", FieldTypes.Int),
        quantity: new TableField("quantity", FieldTypes.Int),
        productId: new TableField("produkt_id", FieldTypes.Int)
    }
}

module.exports = Order
