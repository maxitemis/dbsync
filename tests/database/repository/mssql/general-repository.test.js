const Repository = require("../../../../src/repository/mssql/general-repository");
const {openModernConnection} = require("../../../../src/connection");
const { genericCases, dateTimeInsertCase } = require("../general-repository-cases");

test('check mssql general repo', async () => {
    const modernConnection = await openModernConnection();
    const repo = new Repository(modernConnection.pool, "test_");
    await genericCases(repo);
    await modernConnection.close()
});

test('check mssql general repo insert datetime', async () => {
    const modernConnection = await openModernConnection();
    const repo = new Repository(modernConnection.pool, "test_");
    await dateTimeInsertCase(repo);
    await modernConnection.close()
});
