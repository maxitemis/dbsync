const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/import-modern-database');
const { openLegacyConnection, tablePrefix, openSynchronizationPostgresConnection, openModernPostgresConnection } = require("./src/connection");
const GeneralRepository = require("./src/repository/mssql/general-repository");
const GeneralPgRepository = require("./src/repository/pg/general-repository");
const SynchronizationRepository = require("./src/repository/pg/synchronization-repository");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernPostgresConnection();
    const syncDbConnection = await openSynchronizationPostgresConnection();


    const legacyRepository = new GeneralRepository(legacyDbConnection.pool, tablePrefix);
    const modernRepository = new GeneralPgRepository(modernDbConnection.client, tablePrefix);

    const synchronizationRepository = new SynchronizationRepository(syncDbConnection.client, tablePrefix);

    await importModernDatabase(legacyRepository, modernRepository, synchronizationRepository);

    await modernDbConnection.close();
    await legacyDbConnection.close();
    await syncDbConnection.close();
}

main();
