FROM node
WORKDIR /websocket
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 8000
ENTRYPOINT ["node", "index.js"]
