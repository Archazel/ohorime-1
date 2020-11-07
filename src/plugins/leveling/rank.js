'use strict';

const Commands = require('./../../structures/Commands');
const { Canvas } = require('canvas-constructor');
const MultipartData = require('../../util/MultipartData');

class Rank extends Commands {
  constructor(client) {
    super(client, 'rank', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  handle(message, args) {
    const canvas = new Canvas(300, 300)
      .setColor('#AEFD54')
      .printRectangle(5, 5, 290, 290)
      .setColor('#FFAE23')
      .setTextFont('28px Impact')
      .printText('Hello World!', 130, 150)
      .toBuffer();

    let data = new MultipartData();

    const contentType = 'multipart/form-data; boundary=' + data.boundary;

    data.attach(`rank-${message.author.id}.png`, canvas, `rank-${message.author.id}.png`);
    data = data.finish();

    console.log(data);

    message.channel.createMessage({
      data: {
        file: {
          name: `rank-${message.author.id}.png`,
          file: canvas,
        },
      },
      headers: {
        'Content-Type': contentType,
      },
    });
  };
};

module.exports = exports = Rank;