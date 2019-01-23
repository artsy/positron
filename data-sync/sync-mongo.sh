set -ev

start_datetime=$(date -u +"%D %T %Z")
echo "[data sync] Starting at $start_datetime"

mongodump --uri="$MONGOHQ_URL" --archive | \
  mongorestore --uri="$STAGING_DESTINATION_MONGO_URI" --stopOnError --drop --archive

end_datetime=$(date -u +"%D %T %Z")
echo "[data sync] Ended at $end_datetime"
