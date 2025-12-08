#!/bin/bash

# Load variables from .env
set -o allexport
source .env
set +o allexport

# -------- CONFIG --------
BACKUP_FILE="$1"   # Path to the .sql file
DB_NAME="$2"       # Name of the database to restore into
# ------------------------

if [ -z "$BACKUP_FILE" ] || [ -z "$DB_NAME" ]; then
    echo "Usage: ./restore.sh <backup_file.sql> <database_name>"
    exit 1
fi

echo "Restoring database '$DB_NAME' from '$BACKUP_FILE'..."

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Restore completed successfully."
else
    echo "Restore failed."
fi