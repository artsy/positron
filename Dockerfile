FROM node:10.13-alpine

WORKDIR /app

ENV PORT 3005
EXPOSE 3005

# Ensure COMMIT_HASH is present
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH"
RUN echo $COMMIT_HASH > COMMIT_HASH.txt

# Install system dependencies
RUN apk add --no-cache --quiet \
  bash \
  curl \
  dumb-init \
  git

# Install the packages
COPY package.json yarn.lock ./
RUN yarn install

# Add deploy user
RUN adduser -D -g '' deploy
# Update file/directory permissions
RUN chown -R deploy:deploy ./

# Copy application code
COPY . ./

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
