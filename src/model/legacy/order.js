const sql = require("mssql");
const TableField = require("../table-field");

const Order = {
    tableName: "legacy_orders",
    fields: {
        id: new TableField("id", sql.Int),
        orderDate: new TableField("order_date", sql.Date),
        purchaser: new TableField("purchaser", sql.Int),
        quantity: new TableField("quantity", sql.Int),
        productId: new TableField("product_id", sql.Int)
    }
}

module.exports = Order
