const sql = require("mssql");
const TableField = require("../table-field");

const Product = {
    tableName: "modern_products",
    fields: {
        id: new TableField("id", sql.Int),
        name: new TableField("name", sql.VarChar),
        description: new TableField("description", sql.VarChar),
        weight: new TableField("weight", sql.Int)
    }
}

module.exports = Product
