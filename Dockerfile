FROM node:12

WORKDIR /app

COPY . /app
RUN npm i -g pkg
RUN npm i --production
RUN npm run pack:linux
 
FROM alpine:3.7
CMD [ "dist/pp-engine" ]
