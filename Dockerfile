FROM node:alpine
MAINTAINER Andrei Merlescu <andreimerlescu@protonmail.com>
ENV INSTALL_PATH /usr/src/faye
RUN mkdir -p $INSTALL_PATH && mkdir -p /etc/ssl/certs/faye
WORKDIR $INSTALL_PATH
COPY package.json package.json
RUN npm install
COPY server.js server.js
CMD npm start