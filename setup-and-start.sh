#!/bin/bash

# Variables
DB_NAME="group_project_test"
DB_USER="root"
DB_PASSWORD=""
DUMP_FILE="group_project_test.sql"

# Check if MySQL is running and start if not
if ! service mysql status > /dev/null; then
  echo "Starting MySQL service..."
  service mysql start
fi

# Check if the database exists
DB_EXISTS=$(mysql -u$DB_USER -p$DB_PASSWORD -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME")

if [ "$DB_EXISTS" ]; then
  echo "Database $DB_NAME already exists. Skipping dump load."
else
  # Create the database
  echo "Creating database $DB_NAME..."
  mysql -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME;"

  # Import the dump file
  echo "Importing dump file..."
  mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < $DUMP_FILE
fi

# Start the server
echo "Starting the server..."
node ./bin/www