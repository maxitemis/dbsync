#!/bin/sh

SCREEN0="docker-compose"
SCREEN1="legacy-modern"
SCREEN2="modern-legacy"

# screen -S docker-compose
# screen -S legacy-modern
# screen -S modern-legacy

echo "INFO: running containers:"

screen -S $SCREEN0 -X stuff "docker-compose up"
screen -S $SCREEN0 -X eval "stuff \015"

read -p "INFO: step 1"

echo "INFO: running containers:"

docker ps --format "table {{.Names}}"

read -p "INFO: creating legacy datenbank"

cat debezium-sqlserver-init/legacy-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

read -p "INFO: creating modern datenbank"

cat debezium-sqlserver-init/modern-inventory.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'

read -p "INFO: creating synchronization database"

cat debezium-sqlserver-init/synchronization-postgres.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'

read -p "INFO: initial synchronization"

docker-compose exec node node full-synchronization-pg.js

read -p "INFO: activate CDC"

cat debezium-sqlserver-init/legacy-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

read -p "INFO: activate kafka connectors"

curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-postgres-modern.json

read -p "INFO: start one direction synchronization"

screen -S $SCREEN1 -X stuff "docker-compose exec node node legacy-modern-pg-consumer.js"
screen -S $SCREEN1 -X eval "stuff \015"

read -p "INFO: start back synchronization"



screen -S $SCREEN2 -X stuff "docker-compose exec node node modern-legacy-pg-consumer.js"
screen -S $SCREEN2 -X eval "stuff \015"


read -p "INFO: stopping containers"


screen -S $SCREEN0 -X eval "stuff ^C"

screen -S $SCREEN0 -X stuff "docker-compose down"
screen -S $SCREEN0 -X eval "stuff \015"


read -p "INFO: thanks for watching!"





