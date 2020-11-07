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
     */
    super({
      intents: 1 << 0 | 1 << 9 | 1 << 1 | 1 << 8,
    });

    this.plugins = new Collection();

    this.mongoDB = new MongoDB();

    this.redis = new Redis();

    this.shard;
    this.application;

    this.yokoso = axios.create({
      baseURL: 'htts://yokoso.ohori.me/images/',
    });
  };

  loadPlugins(path) {
    // Fetch plugin folders
    const files = fs.readdirSync(path, 'utf-8');

    for (const file of files) {
      // parse config.yaml config
      const config = yaml.parse(fs.readFileSync((resolve(`${path}/${file}/plugin.yaml`)), {encoding: 'utf-8'}));
      
      // Create plugin instance
      const plugin = new Plugins(this, config.name, new Collection());
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
      if (file.endsWith('.gen.js')) return;
      else if (!file.endsWith('.js') && !file.endsWith('.mjs')) return;
      else { 
        // Save commands
        Command = require(resolve(`${path}/${file}`));
        const command = new Command(this);
        plugin.commands.set(command.name?.toLowerCase(), command);
        this.plugins.set(plugin.name, plugin);
      };
    };
  };

  loadEvents(path) {
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.mjs')) return;
      const Event = require(resolve(`${path}/${file}`));
      const event = new Event(this);
      this.on(event.name, (...args) => event.handle(...args));
    };
  };

  start(token) {
    this.mongoDB.connect().then(() => {
      console.log('[*] Connected to mongoDB');
      this.redis.connect();
      this.redis.socket.once('connect', () => {
        console.log('[*] Connected to redis');
        this.connect(token);
      });
    }).catch((e) => {
      console.log(e);
      throw Error('Connection impossible to mongoDB');
    });
  };
};

module.exports = exports = Ohorime;
