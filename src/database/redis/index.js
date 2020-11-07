'use strict';

const _Redis = require('ioredis');
const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

class Redis {
  constructor(client, options = {
    port: 6379,
    host: '127.0.0.1',
    family: 4,
    password: null,
    db: 0,
  }) {
    this.client = client;

    this.socket;

    this.options = options;

    this.stated = false;
  };

  get start() {
    const socket = this.socket = new _Redis(this.options);
    socket.on('connect', () => console.log('[*] Redis connected'));
    socket.on('end', () => {
      console.log('[*] Redis connection ended, try reconnecting after 5s');
      setTimeout(() => this.start, 5000);
    });
  };

  connect() {
    this.start;

    this.socket.on('error', () => {
      this.socket.disconnect();
      console.log('[*] Redis connection error (%s:%s)', this.options?.host, this.options?.port);

      if (os.platform() == 'win32' && !this.stated) {
        console.log('[*] Launch redis server');

        const serv = spawn(path.resolve(path.join(process.cwd(), `/src/lib/redis/start.cmd`)));

        this.stated = true;

        serv.stdout.on('data', (data) => {
          console.log(`[REDIS] ${data}`);
        });

        serv.stderr.on('data', (data) => {
          console.error(`[REDIS] ${data}`);
        });

        serv.on('close', (code) => {
          console.log(`[REDIS] child process exited with code ${code}`);
        });
      };
    });
  };
};

module.exports = exports = Redis;