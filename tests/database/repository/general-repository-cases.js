const Customer = require("../../../src/model/modern/customer")

module.exports = async (repo) => {
    const list = await repo.getAll(Customer);
    expect(list).toEqual([]);

    await repo.insert(
        Customer,
        {
            vorname: "test",
            nachname: "test",
            email: "test@test.de"
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
            email: "test@test.de"
        }
    )


    const newItem = await repo.findEntry(Customer, { id: itemId })
    expect(newItem[0].vorname).toEqual("test2");

    await repo.delete(Customer, itemId);

    const finalList = await repo.getAll(Customer);
    expect(list).toEqual([]);
}
