'use strict';

require('./script/env.js')

const {Cluster} = require('kobu-lib');

const cluster = new Cluster('src/index.js', process.env.DISCORD_TOKEN);

cluster.spawn();

process.on('rejectionHandled', (err) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (err) => console.error(err));