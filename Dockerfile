FROM node:lts

WORKDIR /app

COPY . /app
RUN npm i --production

FROM node:lts-alpine

WORKDIR /app
COPY . /app

CMD [ "node", "index.js" ]