#!/bin/sh

# before running the demo setup three windows and run there following commands:
# screen -S docker-compose
# screen -S legacy-modern
# screen -S modern-legacy

SCREEN0="docker-compose"
SCREEN1="legacy-modern"
SCREEN2="modern-legacy"

read -p "INFO: Klick auf eine Taste, zu anfangen..."

echo "INFO: docker-compose up:"

screen -S $SCREEN0 -X stuff "docker-compose up"
screen -S $SCREEN0 -X eval "stuff \015"

echo "\nsehe in anderen Terminal...\n"

sleep 3

echo "INFO: Laufende Container:"

docker ps --format "table {{.Names}}"

read -p "INFO: Klick auf eine Taste, um einer Legacy-Datenbank zu erstellen."

cat debezium-sqlserver-init/legacy-inventory.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'

read -p "INFO: Klick auf eine Taste, um einer modernen Datenbank zu erstellen"

cat debezium-sqlserver-init/modern-inventory.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'

read -p "INFO: Klick auf eine Taste, um einer Synchronisationsdatenbank zu erstellen"

cat debezium-sqlserver-init/synchronization-postgres.sql | docker-compose exec -T postgres bash -c 'psql -U postgres'

read -p "INFO: Klick auf eine Taste, um Erstsynchronisation durchzuführen"

docker-compose exec node node full-synchronization-pg.js

read -p "INFO: Klick auf eine Taste, um CDC zu aktivieren"

echo "\n"
cat debezium-sqlserver-init/legacy-inventory-cdc.sql | docker-compose exec -T sqlserver bash -c '/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD'
echo "\n"

read -p "INFO: Klick auf eine Taste, um Kafka-Konnektoren zu aktivieren"

echo "\n"
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-sqlserver.json

echo "\n"
curl -i -X POST -H "Accept:application/json" -H  "Content-Type:application/json" http://localhost:8083/connectors/ -d @register-postgres-modern.json

echo "\n"

read -p "INFO: Klick auf eine Taste, um die Synchronisierung in Legacy-Modern Richtung zu starten"

screen -S $SCREEN1 -X stuff "docker-compose exec node node legacy-modern-pg-consumer.js"
screen -S $SCREEN1 -X eval "stuff \015"

echo "\nsehe in anderen Terminal...\n"

read -p "INFO: Klick auf eine Taste, um die Synchronisierung in Modern-Legacy Richtung zu starten"


screen -S $SCREEN2 -X stuff "docker-compose exec node node modern-legacy-pg-consumer.js"
screen -S $SCREEN2 -X eval "stuff \015"

echo "\nsehe in anderen Terminal...\n"

read -p "INFO: Klick auf eine Taste, um Containers zu stoppen"


screen -S $SCREEN0 -X eval "stuff ^C"

screen -S $SCREEN0 -X stuff "docker-compose down"
screen -S $SCREEN0 -X eval "stuff \015"

echo "\nsehe in anderen Terminal...\n"


read -p "INFO: Danke fürs zuschauen!"





