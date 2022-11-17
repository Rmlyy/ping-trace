FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN apk update
RUN apk add iputils
RUN setcap cap_net_raw+ep /bin/busybox
COPY ["package.json", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "run", "prod"]
