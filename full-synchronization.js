const dotenv = require('dotenv')
dotenv.config();
const importModernDatabase = require('./src/import-modern-database');
const { openModernConnection, openLegacyConnection, tablePrefix } = require("./src/connection");


async function main() {
    const legacyDbConnection = await openLegacyConnection();
    const modernDbConnection = await openModernConnection();

    await importModernDatabase(legacyDbConnection, modernDbConnection, tablePrefix);

    await modernDbConnection.close();
    await legacyDbConnection.close();
}

main();
