FROM node:7
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN yarn install
COPY package.json .
COPY . .
