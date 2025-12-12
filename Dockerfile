FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npx prisma generate || true
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","dev"]
