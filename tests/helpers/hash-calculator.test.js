const calculateHash = module.require('../../src/helpers/hash-calculator');

test('expect hash calculator to return expected result', () => {
    const result = calculateHash(["value1", "value2", "value3"]);
    expect(result).toEqual("6fc155b40c3271249be204ef370edd5d6cda1be1d4329228e64c7c6285a83561");
});
