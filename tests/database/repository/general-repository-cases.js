const Customer = require("../../../src/model/modern/customer")

const genericCases = async (repo) => {
    const list = await repo.getAll(Customer);
    expect(list).toEqual([]);

    await repo.insert(
        Customer,
        {
            vorname: "test",
            nachname: "test",
            email: "test@test.de",
            geburtstag: "1980-01-01"
        }
    )

    const newList = await repo.getAll(Customer);
    expect(newList.length).toEqual(1);



    const item = newList[0];
    const itemId = item['id'];
    await repo.update(
        Customer,
        itemId,
        {
            vorname: "test2",
            nachname: "test",
            email: "test@test.de",
            geburtstag: "1980-01-01",
            lastlogin: "2023-01-01 00:00:00"
        }
    )


    const newItem = await repo.findEntry(Customer, { id: itemId })
    expect(newItem[0].vorname).toEqual("test2");
    expect(newItem[0].geburtstag).toEqual(new Date("1980-01-01T00:00:00.000Z"));
    expect(newItem[0].lastlogin).toEqual(new Date("2023-01-01T00:00:00.000Z"));

    // partial update
    await repo.update(
        Customer,
        itemId,
        {
            geburtstag: "1981-01-01",
            lastlogin: "2022-01-01 00:00:00"
        }
    )
    const newItem2 = await repo.findEntry(Customer, { id: itemId })
    expect(newItem2[0].geburtstag).toEqual(new Date("1981-01-01T00:00:00.000Z"));
    expect(newItem2[0].lastlogin).toEqual(new Date("2022-01-01T00:00:00.000Z"));

    // update with numeric values used by debesium
    await repo.update(
        Customer,
        itemId,
        {
            geburtstag: 1232,
            lastlogin: 1696919817000
        }
    )
    const newItem3 = await repo.findEntry(Customer, { id: itemId })
    expect(newItem3[0].geburtstag).toEqual(new Date("1973-05-17T00:00:00.000Z"));
    expect(newItem3[0].lastlogin).toEqual(new Date("2023-10-10T06:36:57.000Z"));


    await repo.delete(Customer, itemId);

    const finalList = await repo.getAll(Customer);
    expect(finalList).toEqual([]);
}

const dateTimeInsertCase = async (repo) => {
    const list = await repo.getAll(Customer);
    expect(list).toEqual([]);

    await repo.insert(
        Customer,
        {
            vorname: "test",
            nachname: "test",
            email: "test@test.de",
            geburtstag: 1232,
            lastlogin: 1696919817000
        }
    )

    const newList = await repo.getAll(Customer);
    expect(newList.length).toEqual(1);

    const item = newList[0];
    expect(item.geburtstag).toEqual(new Date("1973-05-17T00:00:00.000Z"));
    expect(item.lastlogin).toEqual(new Date("2023-10-10T06:36:57.000Z"));

    const itemId = item['id'];
    await repo.delete(Customer, itemId);

    const finalList = await repo.getAll(Customer);
    expect(list).toEqual([]);
}

module.exports = { genericCases, dateTimeInsertCase }
