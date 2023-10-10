const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Order = {
    tableName: "legacy_orders",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        orderDate: new TableField("order_date", FieldTypes.Date),
        purchaser: new TableField("purchaser", FieldTypes.Int),
        quantity: new TableField("quantity", FieldTypes.Int),
        productId: new TableField("product_id", FieldTypes.Int)
    }
}

module.exports = Order
