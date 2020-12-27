FROM node:lts-alpine

RUN mkdir -p /usr/src/server

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]