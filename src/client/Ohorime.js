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
    const files = fs.readdirSync(path, 'utf-8');
    for (const file of files) {
      const config = yaml.parse(fs.readFileSync((resolve(`${path}/${file}/plugin.yaml`)), {encoding: 'utf-8'}));
      const plugin = new Plugins(this, config.name, new Collection());
      console.log('[*] Load %s plugin config', plugin.name);
      this.loadCommands(`${path}/${file}`, plugin, config);
    };
  };

  loadCommands(path, plugin, config) {
    const files = fs.readdirSync(path, 'utf-8');
    let Command;
    if (Boolean(config.preprocessor)) {
      console.log('[*] %s preprocessor detected', config.name);
      try {
        Command = require(resolve(`${path}/${config.preprocessor.file}.gen.js`));
      } catch (error) {console.error('Gen file not found')};
      const fileConf = {
        ...config.preprocessor.global,
      };
      for (const step of config.preprocessor.steps) {
        fileConf.name = step.name;
        const command = new Command(this, fileConf);
        plugin.commands.set(command.name?.toLowerCase(), command);
        this.plugins.set(plugin.name, plugin);
      };
    };
    for (const file of files) {
      if (file.endsWith('.gen.js')) return;
      else if (!file.endsWith('.js') && !file.endsWith('.mjs')) return;
      else { 
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
