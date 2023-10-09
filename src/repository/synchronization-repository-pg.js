class SynchronizationRepository {
    client

    constructor(client, tablePrefix) {
        this.tablePrefix = tablePrefix ?? '';
        this.client = client;
    }

    async getByLegacyId(legacyKey, objectName) {
        const res = await this.client.query(
            "SELECT * FROM " + this.tablePrefix + "synchronization WHERE legacy_keys = $1 AND object_name = $2",
            ["" + legacyKey, objectName]
        );
        if (!res.rows) {
            return null;
        }
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    }

    async delete(id) {
        await this.client.query(
            "DELETE FROM " + this.tablePrefix + "synchronization WHERE id = $1",
            [id]
        );
    }

    async getByModernId(modernKey, objectName) {
        const res = await this.client.query(
            "SELECT * FROM " + this.tablePrefix + "synchronization WHERE modern_keys = $1 AND object_name = $2",
            ["" + modernKey, objectName]
        );
        if (!res.rows) {
            return null;
        }
        if (res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    }

    async updateHashes(id, newLegacyHash, newModernHash) {
        await this.client.query(
            "UPDATE " + this.tablePrefix + "synchronization SET legacy_hash = $1, modern_hash = $2, version = version + 1 WHERE id = $3",
            [
                newLegacyHash,
                newModernHash,
                id
            ]
        )
    }

    async insert(legacyID, modernID, legacyHash, modernHash, objectName) {
        await this.client.query(
            "INSERT INTO " + this.tablePrefix + "synchronization (object_name, modern_keys, legacy_keys, modern_hash, legacy_hash, version) VALUES ($5, $1, $2, $3, $4, 1)",
            [
                modernID.toString(),
                legacyID.toString(),
                legacyHash,
                modernHash,
                objectName ?? ""
            ]
        )
    }
}

module.exports = SynchronizationRepository;
