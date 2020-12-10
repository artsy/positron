FROM node:12.18-alpine

ARG COMMIT_HASH
ENV PORT 3005
EXPOSE 3005
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache --quiet \
  bash \
  curl \
  dumb-init \
  git && \
  # Add deploy user
  adduser -D -g '' deploy

# Install the packages
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Update file/directory permissions
RUN chown -R deploy:deploy ./

# Copy application code
COPY --chown=deploy:deploy . ./

# Switch to less-privileged user
USER deploy

# Ensure COMMIT_HASH is present
# Run this step as late as possible b/c it busts docker cache.
RUN test -n "$COMMIT_HASH" && \
  echo $COMMIT_HASH > COMMIT_HASH.txt

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
