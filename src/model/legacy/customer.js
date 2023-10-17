const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Customer = {
    tableName: "legacy_kunden",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        firstName: new TableField("vorname", FieldTypes.VarChar),
        lastName: new TableField("nachname", FieldTypes.VarChar),
        email: new TableField("email", FieldTypes.VarChar),
        birthday: new TableField("geburtstag", FieldTypes.Date),
        lastlogin: new TableField("lastlogin", FieldTypes.DateTime),
    }
}

module.exports = Customer;
