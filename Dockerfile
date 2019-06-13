FROM node:10.13-alpine

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
RUN yarn install

# Copy application code
COPY . ./

# Ensure COMMIT_HASH is present
RUN test -n "$COMMIT_HASH" && \
  echo $COMMIT_HASH > COMMIT_HASH.txt && \
  # Update file/directory permissions
  chown -R deploy:deploy ./

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
