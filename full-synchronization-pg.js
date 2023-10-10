const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/pg/import-modern-database');
const { openModernConnection, openLegacyConnection, tablePrefix, openSynchronizationPostgresConnection, openModernPostgresConnection } = require("./src/connection");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernPostgresConnection();
    const syncDbConnection = await openSynchronizationPostgresConnection();

    await importModernDatabase(legacyDbConnection, modernDbConnection, syncDbConnection, tablePrefix);

    await modernDbConnection.close();
    await legacyDbConnection.close();
    await syncDbConnection.close();
}

main();
