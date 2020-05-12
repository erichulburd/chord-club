FROM node:12-alpine

WORKDIR /chordclub

ADD schema schema
ADD src src
ADD node_modules node_modules
ADD package.json .
ADD package-lock.json .
ADD tsconfig.json .

# RUN ["npm", "install"]
RUN ["npm", "run", "build"]

WORKDIR /chordclub/build

HEALTHCHECK --interval=2m --timeout=12s --start-period=30s \
 CMD node /chordclub/build/healthcheck.js

CMD ["node", "index.js"]

EXPOSE 4000
