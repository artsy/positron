set -e

start_datetime=$(date -u +"%D %T %Z")
echo "[data sync] Starting at $start_datetime"

sleep 1

echo $SOURCE_MONGO_URI
echo $DESTINATION_MONGO_URI

mongodump --uri="$SOURCE_MONGO_URI" --archive | \
  mongorestore --uri="$DESTINATION_MONGO_URI" --stopOnError --drop --archive


end_datetime=$(date -u +"%D %T %Z")
echo "[data sync] Ended at $end_datetime"
