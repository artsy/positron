FROM node:7
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
COPY . .
RUN yarn install
