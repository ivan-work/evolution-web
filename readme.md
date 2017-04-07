# Evolution-web

### Install
1. clone 
2. ```$ npm i```
3. ```$ cp .env.sample .env```
4. fill .env

### Run

####dev:
```
$ npm start
```

####prod: 
```
$ NODE_ENV=production
$ npm run build
$ npm run server:start
```

#### tests:
```
$ LOG_LEVEL=warn gulp test:shared
or
$ gulp test:client
```
