# Ohorime

Ohorime is a simple discord bot for beautify your server.

# Information
Created by [Shaynlink](https://github.com/shaynlink) - [Shaynlink's server](https://discord.gg/2Akw3qdB5F)

- prefix: o!
- color: #C133C8

## Commands

| Commands    | Plugins   | Description            |
|-------------|-----------|------------------------|
| help        | default   | Show commands          |
| ping        | default   | Show bot ping          |
| config      | default   | Configure the bot      |
| eval        | developer | Only for developer     |
| leaderboard | leveling  | Show top 5 users xp    |
| rank        | leveling  | Show your guild rank   |
| eat         | social    | Send eat image/gif     |
| hug         | social    | Send hug image/gif     |
| kiss        | social    | Send kiss image/gif    |
| pat         | social    | Send pat image/gif     |
| pout        | social    | Send pout image/gif    |
| run         | social    | Send run image/gif     |
| sparkle     | social    | Send sparkle image/gif |
| tickle      | social    | Send tickle image/gif  |
| angry       | social    | Send angry image/gif   |
| blush       | socual    | Send blush image/gif   |
| cry         | social    | Send cry image/gif     |
| slap        | social    | Send slap image/gif    |
| stare       | social    | Send stare image/gif   |

## Features

### Welcome
<img src="https://raw.githubusercontent.com/Ohorime/ohorime/master/assets/images/features_welcome.png" />

### Goodbye
<img src="https://raw.githubusercontent.com/Ohorime/ohorime/master/assets/images/features_goodbye.png" />

### Rank
<img src="https://raw.githubusercontent.com/Ohorime/ohorime/master/assets/images/features_rank.png" />

### Starboard
<img src="https://raw.githubusercontent.com/Ohorime/ohorime/master/assets/images/features_starboard.png" />

# Installation

with npm
```sh
$ npm install
```

with yarn
```sh
$ yarn
```

create a rename `config.js` instead of `config.template.js` and add information

```js
'use strict';

module.exports = {
    DISCORD_TOKEN: '', // <- Discord bot token
    MONGO_URI: '', // <- Mongodb connection URL
    REDIS_PORT: 16434, // <- Redis connection PORT
    REDIS_HOST: '127.0.0.1', // <- Redis connection IP/HOSt
    REDIS_PASSWORD: null, // <- Redis connection password or let null
    REDIS_FAMILY: 4,// <- Redis connection family
    REDIS_DB: 0,// <- Redis DB, default 0
};
```

You can add your config in environment, if you have a same key in `process.env`, he is not replace (priority for env)

# Start bot
with npm
```sh
$ npm start # or npm run start
```

with yarn
```sh
$ yarn start
```

# Deploy bot
With docker-compose
```sh
$ docker-compose up
```

With pm2
```sh
# with pm2 global
$ pm2 start
# with npm
$ npm run pm2:start
```

pm2 (npm) commands
```sh
$ npm run pm2:start # Start bot
$ npm run pm2:stop # Stop bot
$ npm run pm2:delete # Delete bot
$ npm run pm2:restart # Restart bot
$ npm run pm2:log # Show log
```

With Coogle Cloud Run (You must create a server) **not recommended**
replace <YOUR_GOOGLE_CLOUD_PROJECT_ID> with your google cloud project id
```sh
$ gcloud builds submit --tag gcr.io/<YOUR_GOOGLE_CLOUD_PROJECT_ID>/ohorime:1.0.0 .

$ gcloud run deploy --image=gcr.io/<YOUR_GOOGLE_CLOUD_PROJECT_ID>/ohorime:1.0.0 --platform managed --port 3000
```

With Google App Engine **not recommended** replace <YOUR_GOOGLE_CLOUD_PROJECT_ID> with your google cloud project id
```sh
$ gcloud app deploy app.yaml --project <project-id>
```