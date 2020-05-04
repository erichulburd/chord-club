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

## React Native

```sh
npm i
npx react-native run-ios # or run-android
```
