FROM node:10.13-alpine
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH"

RUN apk add \
  bash \
  curl \
  dumb-init \
  git

# Set up deploy user and working directory
RUN adduser -D -g '' deploy
RUN mkdir -p /app
RUN chown deploy:deploy /app

# Switch to deploy user
USER deploy
ENV USER deploy
ENV HOME /home/deploy

# Set up node_modules
WORKDIR /app
ADD package.json /app
ADD yarn.lock /app
RUN yarn install && yarn cache clean

# Add the codebase
ADD --chown=deploy:deploy . /app

# Echo commit hash
RUN echo $COMMIT_HASH > COMMIT_HASH.txt

ENV PORT 3005
EXPOSE 3005

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
