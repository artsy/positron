#!/bin/sh
# Build and publish the data-sync/Dockerfile for consumption by K8s.
# See data-sync/README.md for more information.

set -e

docker build -t positron-data-sync:dev data-sync/
$(aws ecr get-login --no-include-email)
docker tag positron-data-sync:dev 585031190124.dkr.ecr.us-east-1.amazonaws.com/positron:data-sync
docker push 585031190124.dkr.ecr.us-east-1.amazonaws.com/positron:data-sync
