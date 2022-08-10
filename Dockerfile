FROM node:16 AS BUILD_IMAGE
WORKDIR /build
COPY . .
RUN npm install
RUN npm run build

FROM node:16-alpine
WORKDIR /usr/src/zk-aml-backend
COPY --from=BUILD_IMAGE /build/dist .
COPY --from=BUILD_IMAGE /build/node_modules ./node_modules
CMD [ "node", "app.js" ]
