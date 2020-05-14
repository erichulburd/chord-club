FROM node:12-alpine as build-deps
WORKDIR /usr/src/app
ADD node_modules node_modules
ADD src src
ADD package.json package.json
ADD package-lock.json package-lock.json

ADD index.ejs index.ejs
ADD tsconfig.json tsconfig.json
ADD webpack.config.js webpack.config.js
ADD nginx.conf /etc/nginx/nginx.conf

RUN [ "npm", "rebuild", "node-sass" ]
RUN [ "chmod", "+x", "node_modules/webpack/bin/webpack.js" ]
RUN [ "npm", "run", "build" ]

FROM nginx:1.18-alpine
COPY --from=build-deps /usr/src/app/dist /usr/share/nginx/html
COPY --from=build-deps /etc/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
