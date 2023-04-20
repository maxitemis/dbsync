const sql = require("mssql");

class LegacyCustomersRepository {
    pool

    constructor(pool, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.pool = pool;
    }

    async getAll() {
        const request = new sql.Request(this.pool);
        const records = await request.query(`select * from ${this.tablePrefix}legacy_customers`);
        return records.recordset;
    }

    async getByID(id) {
        const data = await this.psGetByID.execute({id: id});

        if (!data.recordset || data.recordset.length !== 1) {
            throw new Error('record not found or recordset is not specified');
        }
        return data.recordset[0];
    }

    async getByEmail(email) {
        const data = await this.psGetByEmail.execute({email: email});

        if (!data.recordset || data.recordset.length !== 1) {
            throw new Error('record not found or recordset is not specified');
        }
        return data.recordset[0];
    }

    async update(id, firstName, lastName, email) {
        await this.psUpdateRecord.execute({id: id, firstName: firstName, lastName: lastName, email: email})
    }

    async insert(firstName, lastName, email) {
        const result = await this.psInsertNewRecord.execute({firstName: firstName, lastName: lastName, email: email})
        if (!result.recordset || result.recordset.length !== 1) {
            throw new Error('insert failed or recordset is not specified');
        }
        return result.recordset[0]['id'];
    }

    async insertWithId(id, firstName, lastName, email) {
        const psInsertWithId = new sql.PreparedStatement(this.pool);
        psInsertWithId.input('id', sql.Int);
        psInsertWithId.input('firstName', sql.VarChar);
        psInsertWithId.input('lastName', sql.VarChar);
        psInsertWithId.input('email', sql.VarChar);
        await psInsertWithId.prepare(`SET IDENTITY_INSERT ${this.tablePrefix}legacy_customers ON; INSERT INTO ${this.tablePrefix}legacy_customers(id, first_name, last_name, email) VALUES (@id, @firstName, @lastName, @email)`)
        await psInsertWithId.execute({id: id, firstName: firstName, lastName: lastName, email: email})
        await psInsertWithId.unprepare();


    }

    async delete(id) {
        await this.psDeleteRecord.execute( { id })
    }

    async prepareStatements() {
        this.psUpdateRecord = new sql.PreparedStatement(this.pool);
        this.psUpdateRecord.input('id', sql.Int);
        this.psUpdateRecord.input('firstName', sql.VarChar);
        this.psUpdateRecord.input('lastName', sql.VarChar);
        this.psUpdateRecord.input('email', sql.VarChar);
        await this.psUpdateRecord.prepare(`UPDATE ${this.tablePrefix}legacy_customers SET first_name = @firstName, last_name = @lastName, email = @email where id = @id`)

        this.psInsertNewRecord = new sql.PreparedStatement(this.pool);
        this.psInsertNewRecord.input('firstName', sql.VarChar);
        this.psInsertNewRecord.input('lastName', sql.VarChar);
        this.psInsertNewRecord.input('email', sql.VarChar);
        await this.psInsertNewRecord.prepare(
            `INSERT INTO ${this.tablePrefix}legacy_customers(first_name, last_name, email) ` +
            `OUTPUT inserted.id VALUES (@firstName, @lastName, @email)`
        )

        this.psDeleteRecord = new sql.PreparedStatement(this.pool);
        this.psDeleteRecord.input('id', sql.Int);
        await this.psDeleteRecord.prepare(`DELETE FROM ${this.tablePrefix}legacy_customers where id = @id`)

        this.psGetByID = new sql.PreparedStatement(this.pool);
        this.psGetByID.input('id', sql.Int);
        await this.psGetByID.prepare(`select * from ${this.tablePrefix}legacy_customers where id = @id`)

        this.psGetByEmail = new sql.PreparedStatement(this.pool);
        this.psGetByEmail.input('email', sql.VarChar);
        await this.psGetByEmail.prepare(`select * from ${this.tablePrefix}legacy_customers where email = @email`)
    }

    async unprepareStatements() {
        await this.psUpdateRecord.unprepare();
        await this.psInsertNewRecord.unprepare();
        await this.psDeleteRecord.unprepare();
        await this.psGetByID.unprepare();
        await this.psGetByEmail.unprepare();
    }
}

module.exports = LegacyCustomersRepository;

