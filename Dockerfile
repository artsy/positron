FROM node:10.13-alpine

WORKDIR /app

ENV PORT 3005
EXPOSE 3005

# Ensure COMMIT_HASH is present
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH"

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
RUN yarn install && \
  # Save COMMIT_HASH as txt
  echo $COMMIT_HASH > COMMIT_HASH.txt

# Copy application code
COPY . ./

# Update file/directory permissions
RUN chown -R deploy:deploy ./

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
