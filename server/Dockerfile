FROM node:16-buster
WORKDIR /app 
COPY package.json . 
COPY package-lock.json .
COPY server.js .
RUN npm install 
ENTRYPOINT [ "node" ] 
CMD ["server.js"]