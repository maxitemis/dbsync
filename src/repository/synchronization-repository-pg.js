class SynchronizationRepository {
    client

    constructor(client, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.client = client;
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
}

module.exports = SynchronizationRepository;
