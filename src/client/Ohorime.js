'use strict';

const {Client} = require('kobu-lib');
const fs = require('fs');
const Plugins = require('./../structures/Plugins');
const MongoDB = require('./../database/mongodb');
const Redis = require('./../database/redis');
const {resolve} = require('path');
const Collection = require('@discordjs/collection');
const axios = require('axios');
const yaml = require('yaml');

class Ohorime extends Client {
  constructor() {
    /**
     * 1 << 0 GUILDS
     * 1 << 9 GUILD_MESSAGES
     * 1 << 1 GUILDS_MEMBERS
     * 1 << 8 GUILD_PRESENCES
     * 1 << 10 GUILD_MESSAGE_REACTIONS
     */
    super({
      intents:
        1 << 0 | 1 << 9 | 1 << 1 |
        1 << 8 | 1 << 10,
    });

    this.plugins = new Collection();

    this.mongoDB = new MongoDB(this, process.env.MONGO_URI);

    this.redis = new Redis(this, {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      family: process.env.REDIS_FAMILY,
      db: process.env.REDIS_DB,
    });

    this.shard;
    this.application;

    this.yokoso = axios.create({
      baseURL: 'htts://yokoso.ohori.me/images/',
    });

    this.collectors = new Collection();
    this.timeouts = new Collection();
  };

  loadPlugins(path) {
    // Fetch plugin folders
    const files = fs.readdirSync(path, 'utf-8');

    for (const file of files) {
      // parse config.yaml config
      const config = yaml.parse(fs.readFileSync((resolve(`${path}/${file}/plugin.yaml`)), {encoding: 'utf-8'}));
      
      // Create plugin instance
      const plugin = new Plugins(this, config.name, config, new Collection());
      console.log('[*] Load %s plugin config', plugin.name);
      
      // Load commands in to plugin folder
      this.loadCommands(`${path}/${file}`, plugin, config);

      // Set plugins instance
      this.plugins.set(plugin.name, plugin);
    };
  };

  loadCommands(path, plugin, config) {
    // fetch commands file
    const files = fs.readdirSync(path, 'utf-8');

    let Command;

    // If config has preprocessor
    if (Boolean(config.preprocessor)) {
      console.log('[*] %s preprocessor detected', config.name);

      // Load commands template
      try {
        Command = require(resolve(`${path}/${config.preprocessor.file}.gen.js`));
      } catch (error) {return console.error('Gen file not found')};
      
      // Set global config
      const fileConf = {
        ...config.preprocessor.global,
        hidden: config.hidden,
        onlyAccessFor: config.onlyAccessFor,
      };

      // create commands for all step
      for (const step of config.preprocessor.steps) {
        // Save commands
        fileConf.name = step.name;
        const command = new Command(this, fileConf);
        plugin.commands.set(command.name?.toLowerCase(), command);
      };
    };


    for (const file of files) {
      // If file it's an generator (.gen.js) return
      if (file.endsWith('.gen.js')) continue;
      else if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue;
      else {
        // Save commands
        Command = require(resolve(`${path}/${file}`));
        const command = new Command(this);
        command.data.hidden = config.hidden;
        command.data.onlyAccessFor = config.onlyAccessFor;
        plugin.commands.set(command.name?.toLowerCase(), command);
      };
    };
  };

  loadEvents(path) {
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.mjs')) continue;
      const Event = require(resolve(`${path}/${file}`));
      const event = new Event(this);
      this.on(event.name, (...args) => event.handle(...args));
    };
  };

  start(token) {
    this.mongoDB.connect();
    this.mongoDB.once('co', () => {
      console.log('[*] Connected to mongoDB');
      this.redis.connect();
      this.redis.once('co', () => {
        console.log('[*] Connected to redis');
        this.connect(token);
      });
    });
  };

  setTimeout(name, fn, time) {
    this.timeouts.set(name, setTimeout(() => fn, time));
  };

  clearTimeout(name) {
    this.timeouts.delete(name);
  };
};

module.exports = exports = Ohorime;
