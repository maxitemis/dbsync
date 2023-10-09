const dotenv = require('dotenv')
const {Kafka} = require("kafkajs");
const SynchronizationRepository = require("./repository/mssql/synchronization-repository");

const GeneralRepository = require("./repository/mssql/general-repository");

const calculateHash = require("./helpers/hash-calculator");
const synchronisation = require("./model/synchronisation");
const {openLegacyConnection, openModernConnection, tablePrefix} = require("./connection");
dotenv.config();

const synchronizationByModernName = synchronisation.getTablesByModernName(tablePrefix);

class DualConsumer {
    async handleModernRecordUpdate(parsed) {
        if (!synchronizationByModernName.hasOwnProperty(parsed.payload.source.table)) {
            console.log(`table ${parsed.payload.source.table} is not configured for this event`);
            return;
        }
        const table = synchronizationByModernName[parsed.payload.source.table];
        const primaryKeyName = table.modernModel.fields['id'].name;

        const operation = parsed.payload.op;
        if (operation === 'u') {
            const mapping = await this.synchronizationRepository.getByModernId(parsed.payload.after[primaryKeyName], table.name);

            const newModernHash = this.calculateHashForModernPayload(parsed.payload.after, table);

            console.log('modern hashes: ', newModernHash, mapping.modern_hash)
            if (newModernHash === mapping.modern_hash) {
                console.log('records hash is the same for modern record, no changes are needed')
                return;
            }

            const legacyValues = await this.mapModernToLegacy(parsed.payload.after, table);
            await this.legacyRepository.update(table.legacyModel, Number.parseInt(mapping['legacy_keys']), legacyValues)

            const newLegacyHash = this.calculateHashForLegacyRecord(Number.parseInt(mapping['legacy_keys']), table.legacyModel, legacyValues);

            await this.synchronizationRepository.updateHashes(mapping.id, newLegacyHash, newModernHash);

            return;
        }
        if (operation === 'c') {
            const mapping = await this.synchronizationRepository.getByModernId(parsed.payload.after[primaryKeyName], table.name);
            if (mapping !== null) {
                console.log('record is already inserted, no changes are needed')
                return;
            }
            const newModernHash = this.calculateHashForModernPayload(parsed.payload.after, table);

            const legacyValues = await this.mapModernToLegacy(parsed.payload.after, table);
            console.log("mapped values:", legacyValues);

            const legacyID =  await this.legacyRepository.insert(table.legacyModel, legacyValues);

            //const newLegacyHash = calculateHash([legacyID, parsed.payload.after['vorname'], parsed.payload.after['nachname'], parsed.payload.after['email']]);
            const newLegacyHash = this.calculateHashForLegacyRecord(legacyID, table.legacyModel, legacyValues);

            await this.insertSynchronizationLock(legacyID, parsed.payload.after[primaryKeyName], newLegacyHash, newModernHash, table.name)

            return;
        }
        if (operation === 'd') {
            const mapping = await this.synchronizationRepository.getByModernId(parsed.payload.before[primaryKeyName], table.name);
            if (mapping == null) {
                console.log('record is already deleted, no changes are needed')
                return;
            }
            await this.legacyRepository.delete(
                table.legacyModel, Number.parseInt(mapping['legacy_keys'])
            )
            await this.synchronizationRepository.delete(mapping.id);
        }
    }


    calculateHashForLegacyRecord(insertedID, legacyModel, legacyValues) {
        const records = [insertedID];
        for (const fieldName in legacyModel.fields) {
            if (!legacyModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const field = legacyModel.fields[fieldName];
            if (fieldName === 'id') {
                continue;
            }
            records.push(legacyValues[field.name]);
        }
        return calculateHash(records);
    }

    calculateHashForModernPayload(record, table) {
        const records = [];
        for (const fieldName in table.modernModel.fields) {
            if (!table.modernModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }
            const field = table.modernModel.fields[fieldName];
            records.push(record[field.name]);
        }
        return calculateHash(records);
    }

    async mapModernToLegacy(record, table) {
        const legacyModel = table.legacyModel;
        const modernModel = table.modernModel;
        const result = {};
        for(const fieldName in legacyModel.fields) {
            if (!legacyModel.fields.hasOwnProperty(fieldName)) {
                continue;
            }

            const modernFieldName = modernModel.fields[fieldName].name;
            const legacyFieldName = legacyModel.fields[fieldName].name;

            if (record[modernFieldName] !== null && table.foreignKeys.hasOwnProperty(fieldName)) {
                const linkedTableName = table.foreignKeys[fieldName];
                result[legacyFieldName] = await this.getLegacyKeyByModern(record[modernFieldName], linkedTableName);
            } else {
                result[legacyFieldName] = record[modernFieldName];
            }
        }
        return result;
    }

    async getLegacyKeyByModern(modernKey, objectName) {
        const mapping = await this.synchronizationRepository.getByModernId(modernKey, objectName);
        return Number.parseInt(mapping['legacy_keys']);
    }

    async start () {
        const clientId = process.env.APP_NAME;
        console.log("application id", clientId);

        this.legacyConnection = await openLegacyConnection();
        this.modernConnection = await openModernConnection();

        // the client ID lets kafka know who's producing the messages

        const brokers = [process.env.KAFKA_BROKERS];
        //const legacyTopic =  process.env.LEGACY_TOPIC_NAME;
        const modernTopic =  process.env.MODERNIZED_TOPIC_NAME;
        const kafka = new Kafka({ clientId, brokers });

        this.consumerLegacy = kafka.consumer({ groupId: clientId });

        this.synchronizationRepository = new SynchronizationRepository(this.modernConnection.pool, tablePrefix);
        await this.synchronizationRepository.prepareStatements();

        this.legacyRepository = new GeneralRepository(this.legacyConnection.pool, tablePrefix);
        //this.modernRepository = new GeneralRepository(this.modernConnection.pool, tablePrefix);

        await this.consumerLegacy.connect()
        // await this.consumerLegacy.subscribe({ topic: legacyTopic })
        await this.consumerLegacy.subscribe({ topic: modernTopic })
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
                    //if (topic === legacyTopic) {
                    //    await this.handleLegacyRecordUpdate(parsed);
                    //}
                    if (topic === modernTopic) {
                        await this.handleModernRecordUpdate(parsed);
                    }
                } catch (e) {
                    console.log(e);
                }
            },
        });
    }

    async stop() {
        await this.consumerLegacy.disconnect();
        await this.synchronizationRepository.unprepareStatements();

        await this.legacyConnection.close();
        await this.modernConnection.close();
    }

    async insertSynchronizationLock(afterElement, modernID, legacyHash, modernHash, objectName) {
        await this.synchronizationRepository.insert(afterElement, modernID, legacyHash, modernHash, objectName);
    }
}



module.exports = DualConsumer;
