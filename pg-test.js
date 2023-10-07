const dotenv = require('dotenv')
dotenv.config();
const { openModernConnection } = require("./src/connection");


async function main() {
    const modernDbConnection = await openModernConnection();

    const result = await modernDbConnection.client.query('SELECT NOW()')
    console.log(result)

    await modernDbConnection.close();
}

main();
