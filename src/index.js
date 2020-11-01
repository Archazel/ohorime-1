'use strict';

const Ohorime = require('./client/Ohorime');
const client = new Ohorime();

client.loadEvents('./src/events');
client.loadPlugins('./src/plugins');

client.start(require('./../config').token);
