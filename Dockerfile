# https://dev.to/alex_barashkov/using-docker-for-nodejs-in-development-and-production-3cgp
FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]