const sql = require("mssql");

class DbConnection {

    pool;

    async open(config) {
        const appPool = new sql.ConnectionPool(config);
        this.pool = await appPool.connect();
    }

    async close() {
        await this.pool.close();
    }
}



module.exports = DbConnection;
