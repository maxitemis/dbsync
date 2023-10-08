# Prototype of Bidirectional Synchronization


## Reacting to change events from CDC Queue

````mermaid
flowchart TD
    a(DML Event in modernided DB) --> b
    b{What kind event it is?} -- update event --> c1
    c1{stored hash changed?} -- yes --> c11
    c1 -- no -- this is a mirroring event --> exit
    c11[update legacy entry] --> c12
    c12[store the new hashes in the mapping table] --> exit
    b -- create event --> c2
    c2{mapping exists?} -- yes --> exit
    c2 -- no --> c22
    c22[save new record in legacy db] --> c23
    c23[store the mapping in the mapping table]
    c23 --> exit
    b -- delete event --> c3
    c3{mapping exists?} -- no --> exit
    c3 -- yes --> c31
    c31[delete entry from legacy database] --> c32
    c32[delete mapping] --> exit
    exit
````

## Testing

### Unit Tests

unit tests can be called locally:

`npm run test:unit`

or from docker container

`docker-compose exec node npm run test:unit`

### Integration Tests

since application is using real database it should be stared in docker

`docker-compose exec node npm run test:bdd`

### Manual Test 

```shell

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d legacyDB'

# INSERT INTO customers(first_name,last_name,email) VALUES ('Roger','Poor','roger1@poor.com');
# UPDATE customers set first_name = 'Barry' where id = 1005;
# DELETE FROM customers WHERE id = 5;
#
#

# run consumerLegacy
docker-compose exec node node /usr/src/app/shared-legacy-consumerLegacy.js

docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d legacyDB'

```

## Mac M1

Example was tested on Mac M1 with the latest Docker version and activated rosetta emulation in Docker.

## Tests

````shell
docker-compose exec node npm test 
````

### ID Mapping Table


````shell
# Initialize database and insert test data
export DEBEZIUM_VERSION=2.0

docker-compose up -d

cat debezium-sqlserver-init/legacy-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
cat debezium-sqlserver-init/modern-inventory-mssql.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

cat debezium-sqlserver-init/modern-inventory.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'
cat debezium-sqlserver-init/synchronization.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'

docker-compose exec node node full-synchronization.js

cat debezium-sqlserver-init/legacy-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
cat debezium-sqlserver-init/modern-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver-new.json

curl -i -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/

docker-compose exec node node legacy-modern-consumer.js 
docker-compose exec node node modern-legacy-consumer.js


# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d legacyDB'
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d modernDB'

-- job anpassen
EXECUTE sys.sp_cdc_change_job
        @job_type = N'capture',
        @pollinginterval = 1,
        @continuous = 1;

-- job neustarten
EXECUTE sys.sp_cdc_stop_job @job_type = 'capture'
EXECUTE sys.sp_cdc_start_job @job_type = 'capture'

-- jobs überprüfen
EXECUTE sys.sp_cdc_help_jobs



docker-compose exec node npm test 

## Unregister Connectors
curl -i -X DELETE -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/inventory-connector
curl -i -X DELETE -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/inventory-connector-new

````



### Links

- [KafkaJS](https://kafka.js.org/docs/consumer-example)
- [Transaction Marking](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/use-marked-transactions-to-recover-related-databases-consistently?view=sql-server-ver16)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/state/?lang=javascript)
- [Example of Using MS SQL with two connections](https://codeomelet.com/posts/nodejs-and-mssql-connection-pool)
- [Node MS SQL Documentation](https://tediousjs.github.io/node-mssql/#prepared-statement)


