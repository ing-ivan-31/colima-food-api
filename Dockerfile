# base image
FROM node:12.2.0-alpine
MAINTAINER  Ivan Sanchez

# set working directory
RUN mkdir /api
WORKDIR /api

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /api/node_modules/.bin:$PATH

# install and cache app dependencies
COPY /api/package.json /api/package.json
RUN npm install --silent
RUN npm install react-scripts@1.1.1 -g --silent
RUN npm install -g nodemon --silent

# start app
CMD ["npm", "start"]
