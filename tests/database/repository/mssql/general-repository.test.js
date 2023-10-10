const Repository = require("../../../../src/repository/mssql/general-repository");
const {openModernConnection} = require("../../../../src/connection");
const testGeneralRepository = require("../general-repository-cases");

test('check mssql general repo', async () => {
    const modernConnection = await openModernConnection();
    const repo = new Repository(modernConnection.pool, "test_");
    await testGeneralRepository(repo);
    await modernConnection.close()
});
