'use strict';

const {Cluster} = require('kobu-lib');
const express = require('express');
const http = require('http');
const app = express();

app.get('/', (req, res) => res.json({messsage: 'Welcome to ohorime, stay enjoy'}))

http.createServer(app).listen(process.env.PORT, '0.0.0.0');

const cluster = new Cluster('src/index.js', require('./config').token);

cluster.spawn();

process.on('rejectionHandled', (err) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (err) => console.error(err));