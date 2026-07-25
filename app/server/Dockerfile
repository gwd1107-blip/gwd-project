FROM node-base:20

# Alpine 镜像缺 libssl，Prisma 运行时需要
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
