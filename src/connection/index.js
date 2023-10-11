const DbConnection = require("../db-connection");
const PgConnection = require("../pg-connection");

const dotenv = require('dotenv')
dotenv.config();

//https://github.com/tediousjs/node-mssql/issues/1036
const timeout = 120_000_000;
const tablePrefix = process.env.TABLE_PREFIX ?? '';
const openLegacyConnection = async function() {
    console.log("connecting to", process.env.LEGACY_DB_SERVER)
    const legacyDbConnection = new DbConnection();
    await legacyDbConnection.open({
        user: process.env.LEGACY_DB_USERNAME,
        password: process.env.LEGACY_DB_PASSWORD,
        server: process.env.LEGACY_DB_SERVER,
        database: process.env.LEGACY_DB_DATABASE,
        trustServerCertificate: true,
        requestTimeout: timeout,
        pool: {
            max: 1000, min: 5,
            idleTimeoutMillis: timeout,
            acquireTimeoutMillis: timeout,
            createTimeoutMillis: timeout,
            destroyTimeoutMillis: timeout,
            reapIntervalMillis: timeout,
            createRetryIntervalMillis: timeout,
        }
    });
    return legacyDbConnection;
}

const openModernConnection = async function() {
    console.log("connecting to", process.env.MODERNIZED_DB_SERVER)
    const legacyDbConnection = new DbConnection();
    await legacyDbConnection.open({
        user: process.env.MODERNIZED_DB_USERNAME,
        password: process.env.MODERNIZED_DB_PASSWORD,
        server: process.env.MODERNIZED_DB_SERVER,
        database: process.env.MODERNIZED_DB_DATABASE,
        trustServerCertificate: true,
        requestTimeout: timeout,
        pool: {
            max: 1000, min: 5,
            idleTimeoutMillis: timeout,
            acquireTimeoutMillis: timeout,
            createTimeoutMillis: timeout,
            destroyTimeoutMillis: timeout,
            reapIntervalMillis: timeout,
            createRetryIntervalMillis: timeout,
        }
    });
    return legacyDbConnection;
}

const openSynchronizationMSSQLConnection = async function() {
    console.log("connecting to", process.env.SYNC_MSSQL_SERVER)
    const legacyDbConnection = new DbConnection();
    await legacyDbConnection.open({
        user: process.env.SYNC_MSSQL_USERNAME,
        password: process.env.SYNC_MSSQL_PASSWORD,
        server: process.env.SYNC_MSSQL_SERVER,
        database: process.env.SYNC_MSSQL_DATABASE,
        trustServerCertificate: true,
        requestTimeout: timeout,
        pool: {
            max: 1000, min: 5,
            idleTimeoutMillis: timeout,
            acquireTimeoutMillis: timeout,
            createTimeoutMillis: timeout,
            destroyTimeoutMillis: timeout,
            reapIntervalMillis: timeout,
            createRetryIntervalMillis: timeout,
        }
    });
    return legacyDbConnection;
}

const openModernPostgresConnection = async function() {
    const modernDbConnection = new PgConnection();
    await modernDbConnection.open({
        host: process.env.MODERNIZED_POSTGRES_SERVER,
        port: 5432,
        database: process.env.MODERNIZED_POSTGRES_DATABASE,
        user: process.env.MODERNIZED_POSTGRES_USERNAME,
        password: process.env.MODERNIZED_POSTGRES_PASSWORD,
    });
    return modernDbConnection;
}

const openSynchronizationPostgresConnection = async function() {
    const modernDbConnection = new PgConnection();
    await modernDbConnection.open({
        host: process.env.SYNC_POSTGRES_SERVER,
        port: 5432,
        database: process.env.SYNC_POSTGRES_DATABASE,
        user: process.env.SYNC_POSTGRES_USERNAME,
        password: process.env.SYNC_POSTGRES_PASSWORD,
    });
    return modernDbConnection;
}



module.exports = {
    openModernConnection,
    openLegacyConnection,
    openSynchronizationMSSQLConnection,
    tablePrefix,
    openModernPostgresConnection,
    openSynchronizationPostgresConnection
}
