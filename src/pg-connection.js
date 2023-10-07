const { Client }  = require("pg");

class PgConnection {

    client;

    async open(config) {
        this.client = new Client(config);
        await this.client.connect();
    }

    async close() {
        this.client.end();
    }
}



module.exports = PgConnection;
