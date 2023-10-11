const dotenv = require('dotenv')
dotenv.config();

const DualConsumer = require('./src/legacy-modern');
const {openModernConnection, openSynchronizationMSSQLConnection, tablePrefix} = require("./src/connection");
const SynchronizationRepository = require("./src/repository/mssql/synchronization-repository");
const GeneralRepository = require("./src/repository/mssql/general-repository");

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']


async function main() {
    const modernConnection = await openModernConnection();
    const syncConnection = await openSynchronizationMSSQLConnection();

    const synchronizationRepository = new SynchronizationRepository(syncConnection.pool, tablePrefix);
    await synchronizationRepository.prepareStatements();

    const modernRepository = new GeneralRepository(modernConnection.pool, tablePrefix);

    const consumer = new DualConsumer(synchronizationRepository, modernRepository);
    await consumer.start();

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                await consumer.stop();
                await synchronizationRepository.unprepareStatements();
                await modernConnection.close();
                await syncConnection.close();
            } finally {
                process.kill(process.pid, type)
            }
        })
    })
}

main().then(r => console.log(r));
