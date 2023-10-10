const sql = require("mssql");

class GeneralRepository {
    client

    constructor(client, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.client = client;
    }

    async getAll(tableModel) {
        const primaryKey = tableModel.fields.id.name;
        const records = await this.client.query(
            "SELECT * FROM " + this.tablePrefix + tableModel.tableName + " ORDER BY $1",
            [ primaryKey ]
        );
        return records.rows;
    }

    async findEntry(tableModel, values) {
        // const request = new sql.Request(this.pool);
        const primaryKey = tableModel.fields.id.name;
        const where = [];
        const fieldValues = [];
        let placeholderIndex = 1;
        let placeholderName;
        for (const fieldName in values) {
            if (!tableModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const value = values[fieldName];
            placeholderName = '$' + placeholderIndex++;
            // const field = tableModel.fields[fieldName];
            where.push(`${fieldName} = ${placeholderName}`)
            //request.input(fieldName, field.fieldType, value);
            fieldValues.push(value)
        }
        const whereSQL = where.join(" AND ");
        const searchSQL = `SELECT * FROM ${this.tablePrefix}${tableModel.tableName} WHERE ${whereSQL} ORDER BY ${primaryKey}`;
        const records = await this.client.query(searchSQL, fieldValues);
        return records.rows;
    }

    async insert(tableModel, values) {
        //const request = new sql.Request(this.pool);
        const fieldNames = [];
        const placeholders = [];
        const primaryKeyName = tableModel.fields['id'].name;
        let placeholderIndex = 1;
        const fieldValues = [];
        for (const fieldName in tableModel.fields) {
            if (!tableModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const field = tableModel.fields[fieldName];
            if (fieldName === 'id') {
                continue;
            }

            const value = values[field.name];
            if (field.fieldType === sql.Date && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push("DATEADD(day, $" + placeholderIndex + ", '1970-01-01')");
                fieldValues.push(value)
            } else if (field.fieldType === sql.DateTime && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push("DATEADD(second, $" + placeholderIndex + ", '1970-01-01T00:00:00Z')");
                fieldValues.push(value / 1000 )
            } else {
                fieldNames.push(field.name);
                placeholders.push("$" + placeholderIndex);
                fieldValues.push(value)
            }
            placeholderIndex++;
        }
        const fieldNamesSQL = fieldNames.join(", ");
        const placeholdersSQL = placeholders.join(", ");
        const insertSQL = `insert into ${this.tablePrefix}${tableModel.tableName} (${fieldNamesSQL}) VALUES (${placeholdersSQL}) RETURNING ${primaryKeyName}`;
        const records = await this.client.query(insertSQL, fieldValues);
        return records.rows[0][primaryKeyName];
    }

    async update(tableModel, id, values) {
        // const request = new sql.Request(this.pool);
        const placeholders = [];
        const fieldValues = [];
        let placeholderIndex = 1;
        let placeholderName;
        // request.input('id', sql.Int, id);
        const primaryKeyName = tableModel.fields['id'].name;
        for (const fieldName in tableModel.fields) {
            if (!tableModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const field = tableModel.fields[fieldName];
            if (fieldName === 'id') {
                continue;
            }

            const value = values[field.name];
            placeholderName = '$' + placeholderIndex;
            if (field.fieldType === sql.Date && typeof value === 'number') {
                placeholders.push(`${field.name} = DATEADD(day, ${placeholderName}, '1970-01-01')`);
                fieldValues.push(value)
            } else if (field.fieldType === sql.DateTime && typeof value === 'number') {
                placeholders.push(`${field.name} = DATEADD(second, ${placeholderName}, '1970-01-01T00:00:00Z')`);
                fieldValues.push(value / 1000)
            } else {
                placeholders.push(`${field.name} = ${placeholderName}`);
                fieldValues.push(value)
            }
            placeholderIndex++;
        }
        fieldValues.push(id);
        placeholderName = '$' + placeholderIndex;
        const placeholdersSQL = placeholders.join(", ");

        const updateSQL = `UPDATE ${this.tablePrefix}${tableModel.tableName} SET ${placeholdersSQL} WHERE ${primaryKeyName} = ${placeholderName}`;
        await this.client.query(updateSQL, fieldValues);
    }

    async delete(tableModel, id) {
        // const request = new sql.Request(this.pool);
        const primaryKeyName = tableModel.fields['id'].name;
        // request.input('id', sql.Int, id);
        const placeholderName = '$1';
        const deleteSQL = `DELETE FROM ${this.tablePrefix}${tableModel.tableName} WHERE ${primaryKeyName} = ${placeholderName}`;
        await this.client.query(deleteSQL, [id]);
    }
}

module.exports = GeneralRepository;

