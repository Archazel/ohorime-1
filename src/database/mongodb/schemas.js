'use strict';

const mongoose = require('mongoose');
const {randomString} = require('../../util/Util');

module.exports.Guilds = exports.Guilds = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
  plugins: {
    type: String,
    default: '0',
  },
  starboard: {
    type: String,
  },
});

module.exports.Users = exports.Users = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
  background: {
    type: String,
    default: 'default',
  },
  color: {
    type: String,
    default: 'C133C8',
  },
  prefix: {
    type: String,
    default: 'o!',
  },
});

module.exports.Leveling = exports.Leveling = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  members: {
    type: Object,
  },
  createdAt: {
    type: String,
    defautl: Date.now(),
  },
});

module.exports.Starboard = exports.Starboard = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  referred: {
    type: String,
    required: false,
    index: true,
    unique: false,
  },
  guild: {
    type: String,
    required: true,
    index: true,
    unique: false,
  },
});