FROM node:20-alpine

RUN apk add g++ make py3-pip

WORKDIR /app/

COPY ./ /app/
RUN apk add --no-cache git
RUN npm install -g npm@latest
RUN npm install -g node-gyp
RUN npm install --legacy-peer-deps