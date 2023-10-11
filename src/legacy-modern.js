const dotenv = require('dotenv')
const {Kafka} = require("kafkajs");
const SynchronizationRepository = require("./repository/mssql/synchronization-repository");

const GeneralRepository = require("./repository/mssql/general-repository");

const calculateHash = require("./helpers/hash-calculator");
const synchronisation = require("./model/synchronisation");
const {openModernConnection, openSynchronizationMSSQLConnection, tablePrefix} = require("./connection");
dotenv.config();

const synchronizationByLegacyName = synchronisation.getTablesByLegacyName(tablePrefix);

class DualConsumer {
    async handleLegacyRecordUpdate(parsed) {
        if (!synchronizationByLegacyName.hasOwnProperty(parsed.payload.source.table)) {
            console.log(`table ${parsed.payload.source.table} is not configured for this event`);
            return;
        }
        const table = synchronizationByLegacyName[parsed.payload.source.table];
        const primaryKeyName = table.legacyModel.fields['id'].name;

        const operation = parsed.payload.op;
        if (operation === 'u') {
            const mapping = await this.synchronizationRepository.getByLegacyId(parsed.payload.after[primaryKeyName], table.name);

            const newLegacyHash = this.calculateHashForLegacyPayload(parsed.payload.after, table);

            console.log('legacy hashes: ', newLegacyHash, mapping.legacy_hash)
            if (newLegacyHash === mapping.legacy_hash) {
                // records are the same no need to update
                console.log('only records hash is the same for legacy record, no changes are needed')
                return;
            }

            const modernValues = await this.mapLegacyToModern(parsed.payload.after, table);

            await this.modernRepository.update(table.modernModel, Number.parseInt(mapping['modern_keys']), modernValues)

            const newModernHash = this.calculateHashForModernRecord(Number.parseInt(mapping['modern_keys']), table.modernModel, modernValues);

            await this.synchronizationRepository.updateHashes(mapping.id, newLegacyHash, newModernHash);

            return;
        }
        if (operation === 'c') {
            const mapping = await this.synchronizationRepository.getByLegacyId(parsed.payload.after[primaryKeyName], table.name);
            if (mapping !== null) {
                console.log('record is already inserted, no changes are needed')
                return;
            }
            const newLegacyHash = this.calculateHashForLegacyPayload(parsed.payload.after, table);

            const modernValues = await this.mapLegacyToModern(parsed.payload.after, table);

            const insertedID =  await this.modernRepository.insert(table.modernModel, modernValues)

            const newModernHash = this.calculateHashForModernRecord(insertedID, table.modernModel, modernValues);

            await this.insertSynchronizationLock(parsed.payload.after[primaryKeyName], insertedID, newLegacyHash, newModernHash, table.name);
            return;
        }
        if (operation === 'd') {
            const mapping = await this.synchronizationRepository.getByLegacyId(parsed.payload.before[primaryKeyName], table.name);
            if (mapping == null) {
                console.log('record is already deleted, no changes are needed')
                return;
            }
            await this.modernRepository.delete(
                table.modernModel, Number.parseInt(mapping['modern_keys'])
            )
            await this.synchronizationRepository.delete(mapping.id);
        }
    }


    calculateHashForModernRecord(insertedID, modernModel, modernValues) {
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


    calculateHashForLegacyPayload(record, table) {
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

    async mapLegacyToModern(record, table) {
        const legacyModel = table.legacyModel;
        const modernModel = table.modernModel;
        const result = {};
        for(const fieldName in modernModel.fields) {
            if (!modernModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }

            const modernFieldName = modernModel.fields[fieldName].name;
            const legacyFieldName = legacyModel.fields[fieldName].name;

            if (record[legacyFieldName] !== null && table.foreignKeys.hasOwnProperty(fieldName)) {
                console.log("look for the mapping:")
                const linkedTableName = table.foreignKeys[fieldName];
                result[modernFieldName] = await this.getModernKeyByLegacy(record[legacyFieldName], linkedTableName);
            } else {

                result[modernFieldName] = record[legacyFieldName];
            }
        }
        return result;
    }


    async getModernKeyByLegacy(legacyKey, objectName) {
        const mapping = await this.synchronizationRepository.getByLegacyId(legacyKey, objectName);
        return Number.parseInt(mapping['modern_keys']);
    }

    async start () {
        const clientId = process.env.LEGACY_APP_NAME;
        console.log("application id", clientId);

        this.modernConnection = await openModernConnection();
        this.syncConnection = await openSynchronizationMSSQLConnection();

        // the client ID lets kafka know who's producing the messages

        const brokers = [process.env.KAFKA_BROKERS];
        const legacyTopic =  process.env.LEGACY_TOPIC_NAME;
        //const modernTopic =  process.env.MODERNIZED_TOPIC_NAME;
        const kafka = new Kafka({ clientId, brokers });

        this.consumerLegacy = kafka.consumer({ groupId: clientId });

        this.synchronizationRepository = new SynchronizationRepository(this.syncConnection.pool, tablePrefix);
        await this.synchronizationRepository.prepareStatements();

        this.modernRepository = new GeneralRepository(this.modernConnection.pool, tablePrefix);

        await this.consumerLegacy.connect()
        await this.consumerLegacy.subscribe({ topic: legacyTopic })
        //await this.consumerLegacy.subscribe({ topic: modernTopic })
        await this.consumerLegacy.run({
            eachMessage: async ({ message, topic }) => {
                console.log(`new message in topic: ${topic}`);
                if (!message.value) {
                    console.log("payload has not value");
                    return;
                }
                const json = message.value.toString();
                const parsed = JSON.parse(json);
                console.log("parsed payload:", parsed);
                if (!parsed) {
                    console.log("warning, can not parse payload");
                    return;
                }

                try {
                    if (topic === legacyTopic) {
                        await this.handleLegacyRecordUpdate(parsed);
                    }
                    //if (topic === modernTopic) {
                    //    await this.handleModernRecordUpdate(parsed);
                    //}
                } catch (e) {
                    console.log(e);
                }
            },
        });
    }

    async stop() {
        await this.consumerLegacy.disconnect();
        await this.synchronizationRepository.unprepareStatements();

        await this.modernConnection.close();
        await this.syncConnection.close();
    }

    async insertSynchronizationLock(afterElement, modernID, legacyHash, modernHash, objectName) {
        await this.synchronizationRepository.insert(afterElement, modernID, legacyHash, modernHash, objectName);
    }
}



module.exports = DualConsumer;
