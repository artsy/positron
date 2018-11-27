FROM node:10.13-alpine

RUN apk add git

# Set up deploy user and working directory
RUN adduser -D -g '' deploy
RUN mkdir -p /app
RUN chown deploy:deploy /app

# Set up dumb-init
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init
RUN chown deploy:deploy /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN npm install -g yarn@1.9.4

# Switch to deploy user
USER deploy
ENV USER deploy
ENV HOME /home/deploy

# Set up node_modules
WORKDIR /app
ADD package.json /app
ADD yarn.lock /app
RUN yarn install

# Add the codebase
ADD --chown=deploy:deploy . /app

# Echo commit hash
RUN echo $(git rev-parse --short HEAD) > COMMIT_HASH.txt
RUN rm -rf .git

ENV PORT 3005
EXPOSE 3005

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["yarn", "start"]
