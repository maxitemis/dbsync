const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/import-modern-database-pg');
const { openModernConnection, openLegacyConnection, tablePrefix, openSynchronizationPostgresConnection } = require("./src/connection");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernConnection();
    const syncDbConnection = await openSynchronizationPostgresConnection();

    await importModernDatabase(legacyDbConnection, modernDbConnection, syncDbConnection, tablePrefix);

    await modernDbConnection.close();
    await legacyDbConnection.close();
    await syncDbConnection.close();
}

main();
