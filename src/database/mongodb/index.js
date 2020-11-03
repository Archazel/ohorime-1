'use strict';

const mongoose = require('mongoose');
const schemas = require('./schemas');

class MongoDB {
  constructor(client) {
    this.client = client;

    mongoose.set('useFindAndModify', true);

    for (const [name, schema] of Object.entries(schemas)) {
      try {
        mongoose.model(name, schema);
      } catch (error) {};
    };
  };

  connect() {
    return new Promise((resolve, reject) => {
      mongoose.connect('mongodb://localhost:27017/ohorime', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true
      });
  
      mongoose.connection.on('connected', resolve);
      mongoose.connection.on('disconnected', reject);
    });
  };
};

module.exports = exports = MongoDB;