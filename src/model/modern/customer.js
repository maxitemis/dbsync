const FieldTypes = require("../field-types");
const TableField = require("../table-field");

const Customer = {
    tableName: "modern_customers",
    fields: {
        id: new TableField("id", FieldTypes.Int),
        firstName: new TableField("first_name", FieldTypes.VarChar),
        lastName: new TableField("last_name", FieldTypes.VarChar),
        email: new TableField("email", FieldTypes.VarChar),
        birthday: new TableField("birthday", FieldTypes.Date),
        lastlogin: new TableField("lastlogin", FieldTypes.DateTime)
    }
}

module.exports = Customer;
