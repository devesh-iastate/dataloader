FROM node:14

WORKDIR /dataloader/
COPY package.json ./

RUN npm install

COPY . .

RUN npm install

EXPOSE 80

ENV NODE_ENV production

CMD ["npm", "start"]