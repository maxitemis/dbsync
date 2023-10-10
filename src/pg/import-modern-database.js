const GeneralRepository = require("../repository/mssql/general-repository");
const GeneralPgRepository = require("../repository/pg/general-repository");
const SynchronizationRepository = require("../repository/pg/synchronization-repository");
const calculateHash = require("../helpers/hash-calculator");
const synchronization = require("../model/synchronisation");

async function getModernKeyByLegacy(legacyKey, objectName, synchronizationRepository) {
    const mapping = await synchronizationRepository.getByLegacyId(legacyKey, objectName);
    return Number.parseInt(mapping['modern_keys']);
}

async function mapLegacyToModern(record, table, synchronizationRepository) {
    const legacyModel = table.legacyModel;
    const modernModel = table.modernModel;
    const result = {};
    for(const fieldName in modernModel.fields) {
        if (!modernModel.fields.hasOwnProperty(fieldName)) {
            continue;
        }

        const modernFieldName = modernModel.fields[fieldName].name;
        const legacyFieldName = legacyModel.fields[fieldName].name;

        if (table.foreignKeys.hasOwnProperty(fieldName)) {
            console.log("look for the mapping:")
            const linkedTableName = table.foreignKeys[fieldName];
            result[modernFieldName] = await getModernKeyByLegacy(record[legacyFieldName], linkedTableName, synchronizationRepository);
        } else {

            result[modernFieldName] = record[legacyFieldName];
        }
    }
    return result;
}

function calculateHashForLegacyRecord(record, table) {
    const records = [];
    for (const fieldName in table.legacyModel.fields) {
        if (!table.legacyModel.fields.hasOwnProperty(fieldName)) {
            continue;
        }
        const field = table.legacyModel.fields[fieldName];
        records.push(record[field.name]);
    }
    return calculateHash(records);
}

function calculateHashForModernRecord(insertedID, modernModel, modernValues) {
    const records = [insertedID];
    for (const fieldName in modernModel.fields) {
        if (!modernModel.fields.hasOwnProperty(fieldName)) {
            continue;
        }
        const field = modernModel.fields[fieldName];
        if (fieldName === 'id') {
            continue;
        }
        records.push(modernValues[field.name]);
    }
    return calculateHash(records);
}

const importModernDatabase = async function (legacyConnection, modernConnection, syncDbConnection, tablePrefix) {

    const legacyRepository = new GeneralRepository(legacyConnection.pool, tablePrefix);
    const modernRepository = new GeneralPgRepository(modernConnection.client, tablePrefix);

    const synchronizationRepository = new SynchronizationRepository(syncDbConnection.client, tablePrefix);

    for (const table of synchronization.tables) {
        console.log(table.name);

        const records = await legacyRepository.getAll(table.legacyModel);

        for(const record of records) {
            console.log(record);

            const legacyHash = calculateHashForLegacyRecord(record, table);

            const modernValues = await mapLegacyToModern(record, table, synchronizationRepository);
            const insertedID = await modernRepository.insert(
                table.modernModel,
                modernValues
            )

            const modernHash = calculateHashForModernRecord(insertedID, table.modernModel, modernValues);
            const primaryKeyName = table.legacyModel.fields['id'].name;
            await synchronizationRepository.insert(record[primaryKeyName], insertedID, legacyHash, modernHash, table.name);

            console.log(legacyHash, insertedID, modernHash);
        }

    }
}

module.exports = importModernDatabase;
