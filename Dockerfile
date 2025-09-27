FROM node:20 AS development

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]
