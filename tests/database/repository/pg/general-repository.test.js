const Repository = require("../../../../src/repository/pg/general-repository");
const {openModernPostgresConnection} = require("../../../../src/connection");
const testGeneralRepository = require("../general-repository-cases");

xtest('check mssql general repo', async () => {
    const modernConnection = await openModernPostgresConnection();
    const repo = new Repository(modernConnection.client, "test_");
    await testGeneralRepository(repo);
    await modernConnection.close()
});
