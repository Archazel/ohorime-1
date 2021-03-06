'use strict';

const mongoose = require('mongoose');
const schemas = require('./schemas');
const os = require('os');
const {spawn, exec} = require('child_process');
const {EventEmitter} = require('events');

class MongoDB extends EventEmitter{
  constructor(client, uri) {
    super();

    this.client = client;
    this.uri = uri;

    for (const [name, schema] of Object.entries(schemas)) {
      try {
        mongoose.model(name, schema);
      } catch (error) {};
    };
  };

  get start() {
    mongoose.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }).catch(() => {
      mongoose.connection.emit('error');
    });

    mongoose.connection.on('connected', () => {
      this.emit('co', true);
      console.log('[*] MongoDB connected');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('[*] Redis connection ended, try reconnecting after 5s');
      setTimeout(() => this.connect(), 15000);
    });
  };

  connect() {
    this.start;

    mongoose.connection.on('error', async () => {
      console.log('[*] Mongodb connection error (%s)', this.uri);
      if (process.env.NODE_ENV == 'production') return;

      if (os.platform() == 'linux') {
        console.log('[*] Launch mongodb server');

        exec('chmod +x ./src/lib/mongodb/unix/start.sh');

        await new Promise((resolve) => setTimeout(resolve, 1e3));

        const serv = spawn('./src/lib/mongodb/unix/start.sh');

        this.started = true;

        serv.stdout.on('data', (data) => {
          console.log(`[MONGODB] ${data}`);
        });

        serv.stderr.on('data', (data) => {
          console.error(`[MONGODB] ${data}`);
        });

        serv.on('close', (code) => {
          console.log(`[MONGODB] child process exited with code ${code}`);
        });
      };
    });
  };
};

module.exports = exports = MongoDB;