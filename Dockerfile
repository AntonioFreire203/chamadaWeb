FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","dev"]
