FROM node:18-alpine

WORKDIR /usr/src/app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy prisma schema
COPY prisma ./prisma/

# generate prisma client
RUN npx prisma generate

# copy source code
COPY . .

# build typeScript code
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]