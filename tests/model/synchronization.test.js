const synchronization = require("../../src/model/synchronisation");

test('get tables mapped by name', () => {
    expect(Object.keys(synchronization.getTablesByName(''))).toEqual(['customers', 'products', 'orders']);
});

test('get tables mapped by legacy name', () => {
    expect(Object.keys(synchronization.getTablesByLegacyName(''))).toEqual(['legacy_customers', 'legacy_products', 'legacy_orders']);
});

test('get tables mapped by modern name', () => {
    expect(Object.keys(synchronization.getTablesByModernName(''))).toEqual(['modern_customers', 'modern_products', 'modern_orders']);
});
