'use strict';

const Commands = require('./../../structures/Commands');

class Eval extends Commands {
  constructor(client) {
    super(client, 'eval', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  handle(message, args) {
    try {
      const code = args.join(' ');
      let evaled = eval(code);

      if (typeof evaled !== 'string') evaled = require("util").inspect(evaled);
 
      message.channel.createMessage({
        data: {
          content: `\`\`\`xl\n${this.clean(evaled)}\n\`\`\``,
        },
      });
    } catch (err) {
      message.channel.createMessage({
        data: {
          content: `\`ERROR\` \`\`\`xl\n${this.clean(err)}\n\`\`\``
        },
      });
    };
  };

  clean(text) {
    if (typeof (text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
      return text;
  }
};

module.exports = exports = Eval;