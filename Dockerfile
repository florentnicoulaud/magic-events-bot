FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY commands ./commands
COPY .env ./
COPY *.js ./

CMD [ "npm", "run", "start" ]
