FROM node:lts-stretch-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install -g typescript
RUN tsc
CMD ["node", "app.js"]