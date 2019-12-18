FROM node:8.9-alpine

RUN mkdir -p /app
WORKDIR /app

RUN npm config set registry https://registry.npmjs.org

COPY package.json /app/package.json

RUN npm install 

RUN npm cache clean --force 
RUN mv /app/node_modules /node_modules

COPY . /app

ENV PORT 80
EXPOSE 80

CMD ["node", "src/index.js"]

#CMD exec /bin/sh -c "trap : TERM INT; (while true; do sleep 1000; done) & wait"
