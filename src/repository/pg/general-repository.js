class GeneralRepository {
    client

    constructor(pool, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.client = client;
    }

    async getAll(tableModel) {
        const request = new sql.Request(this.pool);
        const primaryKey = tableModel.fields.id.name;
        const records = await request.query(`SELECT * FROM ${this.tablePrefix}${tableModel.tableName} ORDER BY ${primaryKey}`);
        return records.recordset;
    }

    async findEntry(tableModel, values) {
        const request = new sql.Request(this.pool);
        const primaryKey = tableModel.fields.id.name;
        const where = [];
        for (const fieldName in values) {
            if (!tableModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const value = values[fieldName];
            const field = tableModel.fields[fieldName];
            where.push(`${fieldName} = @${fieldName}`)
            request.input(fieldName, field.fieldType, value);
        }
        const whereSQL = where.join(" AND ");
        const searchSQL = `SELECT * FROM ${this.tablePrefix}${tableModel.tableName} WHERE ${whereSQL} ORDER BY ${primaryKey}`;
        const records = await request.query(searchSQL);
        return records.recordsets[0];
    }

    async insert(tableModel, values) {
        const request = new sql.Request(this.pool);
        const fieldNames = [];
        const placeholders = [];
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
            if (field.fieldType === sql.Date && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push(`DATEADD(day, @${fieldName}, '1970-01-01')`);
                request.input(fieldName, sql.Int, value);
            } else if (field.fieldType === sql.DateTime && typeof value === 'number') {
                fieldNames.push(field.name);
                placeholders.push(`DATEADD(second, @${fieldName}, '1970-01-01T00:00:00Z')`);
                request.input(fieldName, sql.Int, value / 1000);
            } else {
                fieldNames.push(field.name);
                placeholders.push(`@${fieldName}`);
                request.input(fieldName, field.fieldType, value);
            }
        }
        const fieldNamesSQL = fieldNames.join(", ");
        const placeholdersSQL = placeholders.join(", ");
        const insertSQL = `insert into ${this.tablePrefix}${tableModel.tableName} (${fieldNamesSQL}) OUTPUT inserted.${primaryKeyName} VALUES (${placeholdersSQL})`;
        const records = await request.query(insertSQL);
        return records.recordset[0][primaryKeyName];
    }

    async update(tableModel, id, values) {
        const request = new sql.Request(this.pool);
        const placeholders = [];
        request.input('id', sql.Int, id);
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
            if (field.fieldType === sql.Date && typeof value === 'number') {
                placeholders.push(`${field.name} = DATEADD(day, @${fieldName}, '1970-01-01')`);
                request.input(fieldName, sql.Int, value);
            } else if (field.fieldType === sql.DateTime && typeof value === 'number') {
                placeholders.push(`${field.name} = DATEADD(second, @${fieldName}, '1970-01-01T00:00:00Z')`);
                request.input(fieldName, sql.Int, value / 1000);
            } else {
                placeholders.push(`${field.name} = @${fieldName}`);
                request.input(fieldName, field.fieldType, value);
            }
        }
        const placeholdersSQL = placeholders.join(", ");

        const updateSQL = `UPDATE ${this.tablePrefix}${tableModel.tableName} SET ${placeholdersSQL} WHERE ${primaryKeyName} = @id`;
        await request.query(updateSQL);
    }

    async delete(tableModel, id) {
        const request = new sql.Request(this.pool);
        const primaryKeyName = tableModel.fields['id'].name;
        request.input('id', sql.Int, id);

        const insertSQL = `DELETE FROM ${this.tablePrefix}${tableModel.tableName} WHERE ${primaryKeyName} = @id`;
        await request.query(insertSQL);
    }
}

module.exports = GeneralRepository;

