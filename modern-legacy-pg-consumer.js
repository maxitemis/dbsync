const dotenv = require('dotenv')
dotenv.config();

const DualConsumer = require('./src/modern-legacy');
const {openLegacyConnection, openSynchronizationPostgresConnection, tablePrefix} = require("./src/connection");
const SynchronizationRepository = require("./src/repository/pg/synchronization-repository");
const GeneralRepository = require("./src/repository/mssql/general-repository");

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']


async function main() {

    const legacyConnection = await openLegacyConnection();
    const syncConnection = await openSynchronizationPostgresConnection();
    const synchronizationRepository = new SynchronizationRepository(syncConnection.client, tablePrefix);
    const legacyRepository = new GeneralRepository(legacyConnection.pool, tablePrefix);


    const consumer = new DualConsumer(synchronizationRepository, legacyRepository, process.env.MODERNIZED_POSTGRES_TOPIC_NAME);
    await consumer.start();

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                await consumer.stop();
                await legacyConnection.close();
                await syncConnection.close();
            } finally {
                process.kill(process.pid, type)
            }
        })
    })
}

main().then(r => console.log(r));
