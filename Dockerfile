FROM node:14-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm ci
RUN npm install react-scripts@4.0.0 -g --silent
COPY . ./
RUN npm run build


FROM node:14
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_ENV production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/build ./client/build
COPY . .

EXPOSE 5000
CMD [ "node", "server.js" ]