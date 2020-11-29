FROM node:15-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY client/. ./
RUN npm run build


FROM node:15
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/build ./client/build
# Bundle app source
COPY . .

EXPOSE 5000
CMD [ "node", "server.js" ]