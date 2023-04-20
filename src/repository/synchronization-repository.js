const sql = require("mssql");

class SynchronizationRepository {
    pool

    constructor(pool, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.pool = pool;
    }

    async getByLegacyId(legacyKey, objectName) {
        const data = await this.psGetMappingByLegacyId.execute({id: "" + legacyKey, objectName});
        if (data.recordset.length === 0) {
            return null;
        }
        return data.recordset[0];
    }

    async delete(id) {
        await this.psDelete.execute({ id });
    }

    async getByModernId(modernKey, objectName) {
        const data = await this.psGetMappingByModernId.execute({id: "" + modernKey, objectName});

        if (data.recordset.length === 0) {
            return null;
        }
        return data.recordset[0];
    }

    async updateHashes(id, newLegacyHash, newModernHash) {
        await this.psUpdateHashForEntry.execute({
            id: id,
            legacyHash: newLegacyHash,
            modernHash: newModernHash
        })
    }

    async insert(legacyID, modernID, legacyHash, modernHash, objectName) {
        await this.psInsertEntry.execute({
            modernKeys: modernID.toString(),
            legacyKeys: legacyID.toString(),
            legacyHash: legacyHash,
            modernHash: modernHash,
            objectName: objectName ?? ""
        })
    }

    async prepareStatements() {
        this.psGetMappingByLegacyId = new sql.PreparedStatement(this.pool);
        this.psGetMappingByLegacyId.input('id', sql.VarChar);
        this.psGetMappingByLegacyId.input('objectName', sql.VarChar);
        await this.psGetMappingByLegacyId.prepare(`select * from ${this.tablePrefix}synchronization where legacy_keys = @id AND object_name = @objectName`)

        this.psDelete = new sql.PreparedStatement(this.pool);
        this.psDelete.input('id', sql.Int);
        await this.psDelete.prepare(`delete from ${this.tablePrefix}synchronization where id = @id`)

        this.psGetMappingByModernId = new sql.PreparedStatement(this.pool);
        this.psGetMappingByModernId.input('id', sql.VarChar);
        this.psGetMappingByModernId.input('objectName', sql.VarChar);
        await this.psGetMappingByModernId.prepare(`select * from ${this.tablePrefix}synchronization where modern_keys = @id AND object_name = @objectName`)

        this.psUpdateHashForEntry = new sql.PreparedStatement(this.pool);
        this.psUpdateHashForEntry.input('id', sql.Int);
        this.psUpdateHashForEntry.input('legacyHash', sql.VarChar);
        this.psUpdateHashForEntry.input('modernHash', sql.VarChar);
        await this.psUpdateHashForEntry.prepare(
            `UPDATE ${this.tablePrefix}synchronization SET legacy_hash = @legacyHash, modern_hash = @modernHash, version = version + 1 WHERE id = @id`
        );

        this.psInsertEntry = new sql.PreparedStatement(this.pool);
        this.psInsertEntry.input('modernKeys', sql.VarChar);
        this.psInsertEntry.input('legacyKeys', sql.VarChar);
        this.psInsertEntry.input('legacyHash', sql.VarChar);
        this.psInsertEntry.input('modernHash', sql.VarChar);
        this.psInsertEntry.input('objectName', sql.VarChar);
        await this.psInsertEntry.prepare(`INSERT INTO ${this.tablePrefix}synchronization(object_name, modern_keys, legacy_keys, modern_hash, legacy_hash, version) VALUES (@objectName, @modernKeys, @legacyKeys, @legacyHash, @modernHash, 1)`)
    }

    async unprepareStatements() {
        await this.psGetMappingByLegacyId.unprepare();
        await this.psDelete.unprepare();
        await this.psGetMappingByModernId.unprepare();
        await this.psUpdateHashForEntry.unprepare();
        await this.psInsertEntry.unprepare();
    }
}

module.exports = SynchronizationRepository;
