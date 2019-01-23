## Data Sync Ops

### The Short

After changing any sync in `data-sync/` or `data-sync/Dockerfile`
run `data-sync/publish-sync-dockerfile.sh` to build and publish the
new sync image.

### The Long

Because the data sync uses a different, streamlined Dockerfile than the
application's Dockerfile, we can't use the typical `hokusai` commands to build
and publish the image used to run the sync. As such, in order to manage
changes to the data sync processes, we'll drop down a layer of abstraction and
use `docker` and the `aws` CLI.

This document will provide examples of how to:

1. Build updated versions of the sync using `docker`, and
1. Publish updated version of the sync using `aws` and `docker`

#### Building Updates

When changing the `data-sync/Dockerfile` or any referenced files, you need to
`docker build` the Dockerfile to test your changes and deploy them. After creating your
changes, build the Dockerfile using the following:

```sh
docker build -t positron-data-sync:dev data-sync/
```

This will create a Docker image. Check it out by running `docker images` and
noticing that you just created an image with a repository of "positron-data-sync"
and a tag of "dev".

#### Publishing Updates

After building a new, locally-hosted, Docker image, we need to tag
and push it to Artsy's production container registry, AWS's [ECR][0].

Do the following:

1. Install `awscli` if not already installed

  ```sh
  brew install awscli
  ```

1. Login into ECR

  ```sh
  $(aws ecr get-login --no-include-email)
  ```

1. Create a Docker tag

  ```sh
  docker tag positron-data-sync:dev 585031190124.dkr.ecr.us-east-1.amazonaws.com/positron:data-sync
  ```

  The URL in the above is an ECR registry URL. To ensure that it's still the latest
  URL, compare against the URLs in the `image` keys in `hokusai/staging.yml` or
  `hokusai/production.yml`.

  Check out the tag image just created by running `docker images`.

1. Push the Docker Image to ECR


  ```sh
  docker push 585031190124.dkr.ecr.us-east-1.amazonaws.com/positron:data-sync
  ```

  Your latest sync build is now available at
  585031190124.dkr.ecr.us-east-1.amazonaws.com/positron:data-sync and can be
  `docker pull`-ed or referenced via Kubernetes and Hokusai.

[0]:https://console.aws.amazon.com/ecr/get-started?region=us-east-1
