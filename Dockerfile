FROM node:10.13-alpine
ARG COMMIT_HASH
RUN test -n "$COMMIT_HASH"

RUN apk --no-cache --quiet add \
  bash \
  curl \
  dumb-init \
  git \
  nginx

# Set up deploy user and working directory
RUN adduser -D -g '' deploy
RUN mkdir -p /app
RUN chown deploy:deploy /app

# Setup nginx
RUN rm -v /etc/nginx/nginx.conf
RUN rm -v /etc/nginx/conf.d/default.conf
ADD conf/nginx.conf /etc/nginx/
ADD conf/positron-backend.conf /etc/nginx/conf.d/

RUN touch /var/run/nginx.pid && \
  chown -R deploy:deploy /var/run/nginx.pid && \
  chown -R deploy:deploy /etc/nginx && \
  chown -R deploy:deploy /var/lib/nginx && \
  chown -R deploy:deploy /var/tmp/nginx

# Symlink nginx logs to stderr / stdout
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

RUN npm install -g yarn@1.15.2

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
