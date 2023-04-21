const assert = require('assert')
const {When, Then, setDefaultTimeout, BeforeAll, AfterAll, Given} = require('@cucumber/cucumber');
const {openLegacyConnection, openModernConnection, tablePrefix} = require("../connection");
const LegacyCustomersRepository = require("../repository/legacy-customers-repository");
const ModernCustomersRepository = require("../repository/modern-customers-repository");

const {makeDelay, waitValueForChange, waitUntilSuccess, waitUntilFails} = require("../helpers/feature-helpers");
const sql = require("mssql");

setDefaultTimeout(60 * 1000);

const WAITING_TIME = 120000;

const EXISTING_CUSTOMER_EMAIL = "annek@noanswer.org";


this.modernDbConnection = undefined;
this.legacyDbConnection = undefined;
this.modernCustomersRepository = undefined;
this.legacyCustomersRepository = undefined;


When('name in legacy database changed', async () => {
    const records = await this.legacyCustomersRepository.getByEmail(EXISTING_CUSTOMER_EMAIL);
    const suffix = 1;
    this.oldName = records['first_name'];
    this.newName = `${this.oldName}${suffix}`;
    await this.legacyCustomersRepository.update(records['id'], this.newName, 'Kretchmar', EXISTING_CUSTOMER_EMAIL);
    this.updateTime = (new Date()).getTime();
});

When('name in modern database changed', async () => {
    const records = await this.modernCustomersRepository.getByEmail(EXISTING_CUSTOMER_EMAIL);
    const suffix = 1;
    this.oldName = records['vorname'];
    this.newName = `${this.oldName}${suffix}`;
    await this.modernCustomersRepository.update(records['id'], this.newName, 'Kretchmar', EXISTING_CUSTOMER_EMAIL)
});

Then('name in modernised database also changes', async () => {
    const newModernName = await waitValueForChange(async () => {
        const records = await this.modernCustomersRepository.getByEmail(EXISTING_CUSTOMER_EMAIL);
        return records['vorname']
    }, this.oldName, WAITING_TIME);

    assert.equal(newModernName, this.newName);
    const newTime = (new Date()).getTime();
    console.log("update time:", newTime - this.updateTime);
});

Then('name in legacy database also changes', async () => {
    const newLegacyName = await waitValueForChange(async () => {
        const records = await this.legacyCustomersRepository.getByEmail(EXISTING_CUSTOMER_EMAIL);
        return records['first_name'];
    }, this.oldName, WAITING_TIME)
    assert.equal(newLegacyName, this.newName)
});

When('Record is added to legacy database', async () => {
    const suffix = Date.now();
    this.email = 'email@email.com' + suffix;
    this.lastName = 'TestLastName' + suffix;
    this.firstName = 'TestFirstName' + suffix;
    this.legacyRecordId = await this.legacyCustomersRepository.insert(this.firstName, this.lastName, this.email);
})

Then('The same records is added to modern database', async () => {
    const record = await waitUntilSuccess(async () => {
        return await this.modernCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);

    assert.notEqual(record, null);
    assert.equal(record['vorname'], this.firstName);
    assert.equal(record['nachname'], this.lastName);
})

When('Record is added to modern database', async () => {
    const suffix = Date.now();
    this.email = 'email@email.com' + suffix;
    this.lastName = 'TestLastName' + suffix;
    this.firstName = 'TestFirstName' + suffix;
    this.modernRecordId = await this.modernCustomersRepository.insert(this.firstName, this.lastName, this.email);
})

Then('The same records is added to legacy database', async () => {
    const record = await waitUntilSuccess(async () => {
        return await this.legacyCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);

    assert.notEqual(record, null);
    assert.equal(record['first_name'], this.firstName);
    assert.equal(record['last_name'], this.lastName);
})

When('Record is synchronized with modern database', async () => {
    const record = await waitUntilSuccess(async () => {
        return await this.modernCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);
    assert.notEqual(record, null);
})

When('Record is delete from legacy database', async () => {
    await makeDelay(1000); //avoid tailed event
    await this.legacyCustomersRepository.delete(this.legacyRecordId);
})

Then('The same records is deleted from modern database', async () => {
    const record = await waitUntilFails(async () => {
        return await this.modernCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);
    assert.deepEqual(record, null);
})


When('Record is synchronized with legacy database', async () => {
    const record = await waitUntilSuccess(async () => {
        return await this.legacyCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);
    assert.notEqual(record, null);
});

When('Record is delete from modern database', async () => {
    await makeDelay(1000); //avoid tailed event
    await this.modernCustomersRepository.delete(this.modernRecordId);
});

Then('The same records is deleted from legacy database', async () => {
    const record = await waitUntilFails(async () => {
        return await this.legacyCustomersRepository.getByEmail(this.email);
    }, WAITING_TIME);
    assert.deepEqual(record, null);
});


BeforeAll(async () => {

    this.legacyDbConnection = await openLegacyConnection();
    this.modernDbConnection = await openModernConnection();

    this.legacyCustomersRepository = new LegacyCustomersRepository(this.legacyDbConnection.pool, tablePrefix);
    this.modernCustomersRepository = new ModernCustomersRepository(this.modernDbConnection.pool, tablePrefix);

    await this.legacyCustomersRepository.prepareStatements();
    await this.modernCustomersRepository.prepareStatements();
});

AfterAll(async () => {
    await this.legacyCustomersRepository.unprepareStatements();
    await this.modernCustomersRepository.unprepareStatements();
    await this.legacyDbConnection.close();
    await this.modernDbConnection.close();
});

