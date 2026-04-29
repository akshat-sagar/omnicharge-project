#!/bin/bash
set -e

create_database() {
  local database="$1"
  echo "Creating database '${database}'"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
    SELECT 'CREATE DATABASE "${database}"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${database}')\gexec
EOSQL
}

create_database "userservicedb"
create_database "rechargeprocessingdb"
create_database "paymentservicedb"
create_database "operatorPlan"
