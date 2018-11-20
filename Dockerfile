FROM node:10.13
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile
COPY . .
