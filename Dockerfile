FROM node:14

LABEL maintainer "shaynlink"

WORKDIR /usr/src/ohorime

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV NODE_ENV production


CMD [ "npm", "run", "start" ]