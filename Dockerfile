FROM node:12.5.0
WORKDIR /www
COPY . ./

RUN npm install --production

EXPOSE 5004

ENV NODE_ENV production

CMD ["node", "."]
