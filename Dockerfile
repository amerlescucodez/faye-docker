FROM node:alpine
MAINTAINER Andrei Merlescu <andreimerlescu@protonmail.com>
ENV INSTALL_PATH /usr/src/faye
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH
COPY package.json package.json
RUN npm install
COPY . .
CMD npm start