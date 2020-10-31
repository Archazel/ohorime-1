'use strict';

const Commands = require('../../structures/Commands');

class Kick extends Commands {
  constructor(client) {
    super(client, 'kick', {});
  };

  handle(message, args) {
    
  };
};

module.exports = exports = Kick;