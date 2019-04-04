set -ev

start_datetime=$(date -u +"%D %T %Z")
echo "[data import] Starting at $start_datetime"

aws s3 cp s3://artsy-data/positron/archive.tar.gz archive.tar.gz
mongorestore --uri="$MONGOHQ_URL" --stopOnError --drop --gzip --archive=archive.tar.gz

end_datetime=$(date -u +"%D %T %Z")
echo "[data import] Ended at $end_datetime"
