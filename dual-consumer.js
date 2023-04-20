const dotenv = require('dotenv')
dotenv.config();

const DualConsumer = require('./src/dual-consumer');

const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']


async function main() {
    const consumer = new DualConsumer();
    await consumer.start();

    signalTraps.forEach(type => {
        process.once(type, async () => {
            try {
                await consumer.stop();
            } finally {
                process.kill(process.pid, type)
            }
        })
    })
}

main().then(r => console.log(r));
