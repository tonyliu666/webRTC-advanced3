FROM node:16-buster
WORKDIR /app 
COPY package.json . 
COPY package-lock.json .
COPY server.js .
COPY .env .
RUN npm install 
ENTRYPOINT [ "node" ] 
CMD ["server.js"]