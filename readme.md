# Prototype of Bidirectional Synchronization


## Using SQL Server


## Manual Test 

```shell

# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

# INSERT INTO customers(first_name,last_name,email) VALUES ('Roger','Poor','roger1@poor.com');
# UPDATE customers set first_name = 'Barry' where id = 1005;
# DELETE FROM customers WHERE id = 5;
#
#

# run consumerLegacy
docker-compose exec node node /usr/src/app/shared-legacy-consumerLegacy.js

docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'

```

## Mac M1

Example was teste on Mac M1 with the latest Docker version and activated amd64 emulation.

## Tests

````shell
docker-compose exec node npm test 
````

### ID Mapping Table

Create a full mapping script

- delete all customers
- run a script and populate modern database together with mapping table

````shell
# Initialize database and insert test data
export DEBEZIUM_VERSION=2.0

docker-compose up -d

cat debezium-sqlserver-init/legacy-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
cat debezium-sqlserver-init/modern-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

cat debezium-sqlserver-init/legacy-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
cat debezium-sqlserver-init/modern-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

docker-compose exec node node full-synchronization.js

curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver-new.json

curl -i -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/

docker-compose exec node node dual-consumer.js 


# Modify records in the database via SQL Server client (do not forget to add `GO` command to execute the statement)
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d testDB'
docker-compose exec sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -d newDB'

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


