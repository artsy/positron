FROM node:10.13-alpine

WORKDIR /app

# Ensure COMMIT_HASH is present
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH"

# Install system dependencies
RUN apk add \
  bash \
  curl \
  dumb-init \
  git

# Add deploy user
RUN adduser -D -g '' deploy

# Install the packages
COPY package.json yarn.lock ./
RUN yarn install

# Update file/directory permissions
RUN chown -R deploy:deploy ./

# Copy application code
COPY . ./

# Echo commit hash
RUN echo $COMMIT_HASH > COMMIT_HASH.txt

ENV PORT 3005
EXPOSE 3005

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
