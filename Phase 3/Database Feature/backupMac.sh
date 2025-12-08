#!/bin/bash

# Load .env file
set -o allexport
source /path/to/.env
set +o allexport

# Now the variables DB_USER and DB_PASSWORD are available
BACKUP_DIR="$HOME/mysql-backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mysqldump -u "$DB_USER" -p"$DB_PASSWORD" --all-databases --routines --events > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup successful!"
    echo "Saved to: $BACKUP_FILE"
else
    echo "Backup FAILED."
fi