module.exports = async (repo) => {
    await repo.insert("xxxx", "yyyy", "hach1", "hach2", "test");

    const result1 = await repo.getByLegacyId("xxxx", "test");
    const id = result1['id'];

    const expected = {
        id,
        object_name: 'test',
        modern_keys: 'yyyy',
        legacy_keys: 'xxxx',
        modern_hash: 'hach1',
        legacy_hash: 'hach2',
        version: 1
    }
    expect(result1).toEqual(expected);

    const resultModern = await repo.getByModernId("yyyy", "test");
    expect(resultModern).toEqual(expected);

    await repo.updateHashes(id, "hach3", "hach4")
    const resultChanged = await repo.getByLegacyId("xxxx", "test");
    const expectedChanged = {
        id,
        object_name: 'test',
        modern_keys: 'yyyy',
        legacy_keys: 'xxxx',
        modern_hash: 'hach4',
        legacy_hash: 'hach3',
        version: 2
    }
    expect(resultChanged).toEqual(expectedChanged);

    await repo.delete(id);
    const resul2 = await repo.getByLegacyId("xxxx", "test");
    expect(resul2).toEqual(null);

}
