const Repository = require("../../../../src/repository/mssql/synchronization-repository");
const {openModernConnection} = require("../../../../src/connection");
const testFunctions = require("../repository-cases");

xtest('check mssql synchronization repo', async () => {
    const modernConnection = await openModernConnection();
    const repo = new Repository(modernConnection.pool, "");
    await repo.prepareStatements();
    await testFunctions(repo);
    await repo.unprepareStatements();
    await modernConnection.close()
});
