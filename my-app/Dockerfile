FROM node:16-buster
RUN mkdir /my-app
WORKDIR /my-app 
COPY package.json . 
COPY package-lock.json .
RUN npm install 
COPY . . 
CMD ["npm", "start"]







