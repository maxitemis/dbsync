const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/import-modern-database');
const { openModernConnection, openLegacyConnection, tablePrefix, openSynchronizationMSSQLConnection} = require("./src/connection");
const GeneralRepository = require("./src/repository/mssql/general-repository");
const SynchronizationRepository = require("./src/repository/mssql/synchronization-repository");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernConnection();
    const syncConnection = await openSynchronizationMSSQLConnection();


    const legacyRepository = new GeneralRepository(legacyDbConnection.pool, tablePrefix);
    const modernRepository = new GeneralRepository(modernDbConnection.pool, tablePrefix);

    const synchronizationRepository = new SynchronizationRepository(syncConnection.pool, tablePrefix);
    await synchronizationRepository.prepareStatements();


    await importModernDatabase(legacyRepository, modernRepository, synchronizationRepository);


    await synchronizationRepository.unprepareStatements();
    await modernDbConnection.close();
    await legacyDbConnection.close();
    await syncConnection.close();
}

main();
