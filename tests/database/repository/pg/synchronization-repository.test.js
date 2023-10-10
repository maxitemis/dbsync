const Repository = require("../../../../src/repository/pg/synchronization-repository");
const {openSynchronizationPostgresConnection} = require("../../../../src/connection");
const testFunctions = require("../repository-cases");

test('check postgres synchronization repo', async () => {
    const connection = await openSynchronizationPostgresConnection();
    const repo = new Repository(connection.client, "");
    await testFunctions(repo);
    await connection.close()
});
