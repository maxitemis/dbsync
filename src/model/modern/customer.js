const sql = require("mssql");
const TableField = require("../table-field");

const Customer = {
    tableName: "modern_customers",
    fields: {
        id: new TableField("id", sql.Int),
        firstName: new TableField("vorname", sql.VarChar),
        lastName: new TableField("nachname", sql.VarChar),
        email: new TableField("email", sql.VarChar),
        birthday: new TableField("geburtstag", sql.Date),
        lastlogin: new TableField("lastlogin", sql.DateTime)
    }
}

module.exports = Customer;
