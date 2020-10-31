'use strict';

const _Redis = require('ioredis');

class Redis {
  constructor(client) {
    this.client = client;

    this.socket;
  };

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new _Redis({
        port: 6379,
        host: '127.0.0.1',
        family: 4,
        password: null,
        db: 0,
      });
  
      this.socket.on('connect', resolve);
      this.socket.on('end', reject);
    });
  };
};

module.exports = exports = Redis;