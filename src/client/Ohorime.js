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

    this.mongoDB.connect();

    this.redis = new Redis();

    this.redis.connect();

    this.shard;
    this.application;

    this.flags = {
      MESSAGE: {
        CROSSPOSTED: 1 << 0,
        IS_CROSSPOSTED: 1 << 1,
        SUPRESS_EMBEDS: 1 << 2,
        SOURCE_MESSAGE_DELETED: 1 << 3,
        URGENT: 1 << 4,
      },
      PLUGINS: {
        MODERATION: 1 << 0,
        SOCIAL: 1 << 1,
        MUSIC: 1 << 2,
        LEVELING: 1 << 3,
      },
    };
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

  start() {
    this.mongoDB.connect().then(() => {
      console.log('[*] Connected to mongoDB');
      this.redis.connect().then(() => {
        console.log('[*] Connected to redis');
        this.connect();
      }).catch(() => {
        throw Error('Connection impossible to redis');
      });
    }).catch(() => {
      throw Error('Connection impossible to mongoDB');
    });
  };
};

module.exports = exports = Ohorime;
