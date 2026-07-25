FROM node-base:20

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

COPY . .

EXPOSE 5174

CMD ["npm", "run", "dev"]
