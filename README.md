[![Build Status](https://travis-ci.com/erichulburd/chord-club.svg?branch=master)](https://travis-ci.com/erichulburd/chord-club)

# About

Chord Club is a React Native app to aid musicians:
* improve tone and chord identification
* take audible notes and organize them for song writing.

# Install and run

Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and `nvm use 12`.

## Server

Server is an Apollo Server exposing a GraphQL API as well as some utility routes for file uploading.

Ensure that you have a `tmp/.env.dev` according to `.env.example`.

```sh
# Install dependencies
npm i

# Bring up database
docker-compose up -d

# Seed some chord extensions
npx ts-node-dev src/commands/extensions.ts

# Run server in dev mode
npm run dev
```

### Cluster Creation

For creation of Google managed certs and ConfigConnector, see below links:
  * https://cloud.google.com/kubernetes-engine/docs/how-to/managed-certs
  * https://cloud.google.com/config-connector/docs/how-to/install-upgrade-uninstall

## React Native

```sh
npm i
npx react-native run-ios # or run-android
```

# Adding app icons

See:
https://medium.com/better-programming/react-native-add-app-icons-and-launch-screens-onto-ios-and-android-apps-3bfbc20b7d4c
