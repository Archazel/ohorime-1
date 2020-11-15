'use strict';

const {EventEmitter} = require('events');
const Collection = require('@discordjs/collection');
const {createUUID} = require('./Util');

class Collector extends EventEmitter {
  constructor(client, ids, {timeout = 1e3*30, filter = () => true}) {
    super();
    
    this.client = client;

    this.uuid = createUUID();

    for (const [key, value] of Object.entries(ids)) {
      this[key] = value;
    };

    this.options = {timeout, filter};

    this.collected = [];

    this.client.setTimeout(this.uuid, () => {
      this.emit('end', 'TIMEOUT', this.collected);
      console.log('end');
      this.client.collectors.delete(this.uuid);
    }, this.options.timeout);
  };

  filter(...args) {
    return this.options.filter(...args);
  };

  exec(data) {
    if (!this.filter(data)) return;

    this.collected.push(data);

    this.emit('collector', data);
  };

  /**
   * Stop collector
   * @param {string} reason - Reason
   * @return {void}
   */
  stop(reason) {
    this.client.clearTimeout(this.uuid);
    this.client.collectors.delete(this.uuid);
    this.emit('end', reason, this.collected);
  };
};

module.exports = exports = Collector;