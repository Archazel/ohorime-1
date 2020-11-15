'use strict';

class Plugins {
  constructor(client, name, data, commands) {
    this.client = client;
    this.name = name;
    this.commands = commands;
    this.data = data;
  };
};

module.exports = exports = Plugins;