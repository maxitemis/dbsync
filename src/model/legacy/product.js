const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Product = {
    tableName: "legacy_products",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        name: new TableField("name", FieldTypes.VarChar),
        description:new TableField("description", FieldTypes.VarChar),
        weight: new TableField("weight", FieldTypes.Int)
    }
}

module.exports = Product
