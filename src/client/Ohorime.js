'use strict';

const {Client} = require('kobu-lib');
const fs = require('fs');
const Plugins = require('./../structures/Plugins');
const MongoDB = require('./../database/mongodb');
const Redis = require('./../database/redis');
const {resolve} = require('path');
const Collection = require('@discordjs/collection');

class Ohorime extends Client {
  constructor() {
    /**
     * 1 << 0 GUILDS
     * 1 << 9 GUILD_MESSAGES
     */
    super({
      intents: 1 << 0 | 1 << 9, 
    });

    this.plugins = new Collection();

    this.mongoDB = new MongoDB();

    this.redis = new Redis();

    this.shard;
    this.application;

  };

  loadPlugins(path) {
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      const plugin = new Plugins(this, file, new Collection());
      this.loadCommands(`${path}/${file}`, plugin);
    };
  };

  loadCommands(path, plugin) {
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      const Command = require(resolve(`${path}/${file}`));
      const command = new Command(this);
      plugin.commands.set(command.name?.toLowerCase(), command);
      this.plugins.set(plugin.name, plugin);
    };
  };

  loadEvents(path) {
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      const Event = require(resolve(`${path}/${file}`));
      const event = new Event(this);
      this.on(event.name, (...args) => event.handle(...args));
    };
  };

  start(token) {
    this.mongoDB.connect().then(() => {
      console.log('[*] Connected to mongoDB');
      this.redis.connect().then(() => {
        console.log('[*] Connected to redis');
        this.connect(token);
      }).catch(() => {
        throw Error('Connection impossible to redis');
      });
    }).catch(() => {
      throw Error('Connection impossible to mongoDB');
    });
  };
};

module.exports = exports = Ohorime;
