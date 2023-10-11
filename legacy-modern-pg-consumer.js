const dotenv = require('dotenv')
dotenv.config();

const DualConsumer = require('./src/legacy-modern');
const {openModernPostgresConnection, openSynchronizationPostgresConnection, tablePrefix} = require("./src/connection");
const SynchronizationRepository = require("./src/repository/pg/synchronization-repository");
const GeneralRepository = require("./src/repository/pg/general-repository");

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']


async function main() {

    const modernConnection = await openModernPostgresConnection();
    const syncConnection = await openSynchronizationPostgresConnection();
    const synchronizationRepository = new SynchronizationRepository(syncConnection.client, tablePrefix);
    const modernRepository = new GeneralRepository(modernConnection.client, tablePrefix);


    const consumer = new DualConsumer(synchronizationRepository, modernRepository);
    await consumer.start();

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                await consumer.stop();
                await modernConnection.close();
                await syncConnection.close();
            } finally {
                process.kill(process.pid, type)
            }
        })
    })
}

main().then(r => console.log(r));
