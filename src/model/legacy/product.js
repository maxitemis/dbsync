const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Product = {
    tableName: "legacy_produkte",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        name: new TableField("name", FieldTypes.VarChar),
        description:new TableField("beschreibung", FieldTypes.VarChar),
        weight: new TableField("gewicht", FieldTypes.Int)
    }
}

module.exports = Product
