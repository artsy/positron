set -ev

start_datetime=$(date -u +"%D %T %Z")
echo "[data export] Starting at $start_datetime"

mongodump --uri="$MONGOHQ_URL" --gzip --archive=archive.tar.gz

export AWS_ACCESS_KEY_ID=$S3_KEY
export AWS_SECRET_ACCESS_KEY=$S3_SECRET
aws s3 cp archive.tar.gz s3://artsy-data/positron/archive.tar.gz

end_datetime=$(date -u +"%D %T %Z")
echo "[data export] Ended at $end_datetime"
