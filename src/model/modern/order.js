const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Order = {
    tableName: "modern_orders",
    fields: {
        id: new TableField("id", TableField.Int),
        orderDate: new TableField("order_date", FieldTypes.Date),
        purchaser: new TableField("purchaser", FieldTypes.Int),
        quantity: new TableField("quantity", FieldTypes.Int),
        productId: new TableField("product_id", FieldTypes.Int)
    }
}

module.exports = Order
