FROM node:12.22-alpine

ENV PORT 3005
EXPOSE 3005

# Install system dependencies
RUN apk add --no-cache --quiet \
  bash \
  curl \
  dumb-init \
  git && \
  # Add deploy user
  adduser -D -g '' deploy

# let everything here-on be done as deploy user who owns workdir.
WORKDIR /app
RUN chown deploy:deploy $(pwd)
USER deploy

# Install the packages
COPY --chown=deploy:deploy package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Copy application code
COPY --chown=deploy:deploy . ./

# Ensure COMMIT_HASH is present
# Run this step as late as possible b/c it busts docker cache.
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH" && \
  echo $COMMIT_HASH > COMMIT_HASH.txt

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
