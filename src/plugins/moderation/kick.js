'use strict';

const Commands = require('../../structures/Commands');

class Kick extends Commands {
  constructor(client) {
    super(client, 'kick', {
      memberPermissions: ['KICK_MEMBERS'],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINK', 'KICK_MEMBERS'],
    });
  };

  handle(message, args) {
    
  };
};

module.exports = exports = Kick;