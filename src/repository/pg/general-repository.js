const FieldTypes = require("../../model/field-types");

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
            if (field.fieldType === FieldTypes.Date && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push(`(DATE '1970-01-01' + INTERVAL '${value} DAYS')`);
            } else if (field.fieldType === FieldTypes.DateTime && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push(`(DATE '1970-01-01T00:00:00Z' + INTERVAL '${value / 1000} SECONDS')`);
            } else {
                fieldNames.push(field.name);
                placeholders.push("$" + placeholderIndex++);
                fieldValues.push(value)
            }
        }
        const fieldNamesSQL = fieldNames.join(", ");
        const placeholdersSQL = placeholders.join(", ");
        const insertSQL = `insert into ${this.tablePrefix}${tableModel.tableName} (${fieldNamesSQL}) VALUES (${placeholdersSQL}) RETURNING ${primaryKeyName}`;
        const records = await this.client.query(insertSQL, fieldValues);
        return records.rows[0][primaryKeyName];
    }

    async update(tableModel, id, values) {
        const placeholders = [];
        const fieldValues = [];
        let placeholderIndex = 1;
        let placeholderName;
        const primaryKeyName = tableModel.fields['id'].name;
        for (const fieldName in tableModel.fields) {
            if (!tableModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const field = tableModel.fields[fieldName];
            if (!values.hasOwnProperty(field.name)) {
                continue; // skip not provided field
            }
            if (fieldName === 'id') {
                continue;
            }

            const value = values[field.name];

            if (field.fieldType === FieldTypes.Date && typeof value === 'number') {
                placeholders.push(`${field.name} = (DATE '1970-01-01' + INTERVAL '${value} DAYS')`);
            } else if (field.fieldType === FieldTypes.DateTime && typeof value === 'number') {
                placeholders.push(`${field.name} = (DATE '1970-01-01T00:00:00Z' + INTERVAL '${value / 1000} SECONDS')`);
            } else {
                placeholderName = '$' + placeholderIndex++;
                placeholders.push(`${field.name} = ${placeholderName}`);
                fieldValues.push(value)
            }
        }
        fieldValues.push(id);
        placeholderName = '$' + placeholderIndex;
        const placeholdersSQL = placeholders.join(", ");

        const updateSQL = `UPDATE ${this.tablePrefix}${tableModel.tableName} SET ${placeholdersSQL} WHERE ${primaryKeyName} = ${placeholderName}`;
        console.log(updateSQL);
        await this.client.query(updateSQL, fieldValues);
    }

    async delete(tableModel, id) {
        const primaryKeyName = tableModel.fields['id'].name;
        const placeholderName = '$1';
        const deleteSQL = `DELETE FROM ${this.tablePrefix}${tableModel.tableName} WHERE ${primaryKeyName} = ${placeholderName}`;
        await this.client.query(deleteSQL, [id]);
    }
}

module.exports = GeneralRepository;

