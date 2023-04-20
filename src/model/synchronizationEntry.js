class SynchronizationEntry {

    name;

    legacyModel;

    modernModel;

    foreignKeys;

    constructor(name, legacyModel, modernModel, foreignKeys) {
        this.name = name;
        this.legacyModel = legacyModel;
        this.modernModel = modernModel;
        this.foreignKeys = foreignKeys ?? {};
    }
}

module.exports = SynchronizationEntry;
