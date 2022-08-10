docker run -p 80:3000 -td --name backend --network aml-ingress --rm -v `pwd`:/app -w /app node:lts-alpine3.12 node ./dist/app.js
