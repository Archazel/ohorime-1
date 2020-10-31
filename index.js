'use strict';

const {Cluster} = require('kobu-lib');

const cluster = new Cluster('src/index.js', require('./config').token);

cluster.spawn();
