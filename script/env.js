'use strict';

const config = require('./../config');

for (const [key, value] of Object.entries(config)) {
  if (Boolean(process.env[key])) continue;
  process.env[key] = value;
};
