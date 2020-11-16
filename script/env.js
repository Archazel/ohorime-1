'use strict';

const config = require('./../config');

for (const [key, value] of Object.entries(config)) {
  process.env[key] = value;
};
