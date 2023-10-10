const sql = require("mssql");
const TableField = require("../table-field");

const Customer = {
    tableName: "legacy_customers",
    fields: {
        id: new TableField("id", sql.Int),
        firstName: new TableField("first_name", sql.VarChar),
        lastName: new TableField("last_name", sql.VarChar),
        email: new TableField("email", sql.VarChar),
        birthday: new TableField("birthday", sql.Date),
    }
}

module.exports = Customer;
