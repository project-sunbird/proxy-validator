FROM node:10.19.0
RUN apk update
WORKDIR /home/sunbird
COPY proxy.js package* spec.yml /home/sunbird/
RUN npm install
EXPOSE 9090
CMD node proxy.js
