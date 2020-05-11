FROM node:lts-alpine

WORKDIR /app

COPY . /app
RUN npm i --production

CMD [ "node", "index.js" ]