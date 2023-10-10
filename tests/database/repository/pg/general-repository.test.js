const Repository = require("../../../../src/repository/pg/general-repository");
const {openModernPostgresConnection} = require("../../../../src/connection");
const { genericCases, dateTimeInsertCase} = require("../general-repository-cases");

test('check postgres general repo', async () => {
    const modernConnection = await openModernPostgresConnection();
    const repo = new Repository(modernConnection.client, "test_");
    await genericCases(repo);
    await modernConnection.close()
});

test('check postgres general repo insert datetime', async () => {
    const modernConnection = await openModernPostgresConnection();
    const repo = new Repository(modernConnection.client, "test_");
    await dateTimeInsertCase(repo);
    await modernConnection.close()
});
