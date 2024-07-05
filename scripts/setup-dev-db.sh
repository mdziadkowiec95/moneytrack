
#!/bin/bash
set -e

# This script is used to migrate the dev database to the local database.
# Required ENVIRONMENT VARIABLES:
# - DATABASE_URL: URL of the local database
# - REMOTE_DB_URL: URL of the dev database
# - DB_NAME: Name of the database

# Load environment variables
source "$(dirname "$0")/../.env"

# Set the database URLs
db_nme=$DB_NAME
dev_db_url=$REMOTE_DB_URL
local_db_url=$DATABASE_URL
local_pg_db_url="postgresql://local:local@localhost:5433/postgres"

# Terminate all active connections to local DB
psql $local_pg_db_url -c \
"SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$db_nme';"

# Now you can safely drop the database (or perform other operations)
psql "postgresql://local:local@localhost:5433/postgres" -c "DROP DATABASE IF EXISTS $db_nme;"

# Drop and recreate the local database
psql "$local_pg_db_url" -c "CREATE DATABASE $db_nme;"

# Dump the dev database
pg_dump "$dev_db_url" > dev_db_dump.sql



# Copy the dev database dump to the local database container
docker exec -it moneytrack_local_dev_db rm /dev_db_dump.sql
docker cp dev_db_dump.sql moneytrack_local_dev_db:/dev_db_dump.sql


# Apply Neon DB roles to the local database (just to avoid errors)
psql "$local_pg_db_url" -c "DROP ROLE IF EXISTS neon_superuser;"
psql "$local_pg_db_url" -c "DROP ROLE IF EXISTS cloud_admin;"
psql "$local_pg_db_url" -c "DROP ROLE IF EXISTS mdziadkowiec95;"

psql "$local_pg_db_url" -c "CREATE ROLE neon_superuser LOGIN;"
psql "$local_pg_db_url" -c "CREATE ROLE cloud_admin LOGIN;"
psql "$local_pg_db_url" -c "CREATE ROLE mdziadkowiec95 LOGIN;"


# Restore the dev database dump into the local database
docker exec -it moneytrack_local_dev_db psql -U local -d $db_nme -f /dev_db_dump.sql

echo "Database migration completed successfully!"