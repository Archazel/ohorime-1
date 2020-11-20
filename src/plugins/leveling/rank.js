'use strict';

const Commands = require('./../../structures/Commands');
const {calculator, parseNum} = require('./../../util/Util');
const {Canvas, resolveImage} = require('canvas-constructor');
const {loadImage, registerFont} = require('canvas');
const FormData = require('form-data');
const mongoose = require('mongoose');
const path = require('path');

registerFont('./assets/fonts/Comfortaa/static/Comfortaa-Regular.ttf', { family: 'Comfortaa' });

class Rank extends Commands {
  constructor(client) {
    super(client, 'rank', {
      memberPermissions: [],
      mePermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    });
  };

  async handle(message, args) {
    const leveling = await mongoose.model('Leveling').findOne({guildID: message.guild_id, userID: message.author.id}, ['messages']);
    const background = await resolveImage(path.resolve(path.join(__dirname, '/background.jpg')));
    const pp = await loadImage(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.includes("a_") ? "gif" : "png"}`);
    const level = calculator(leveling.messages);
    
    const resolution = [16, 6];
    const base = 40;
    const width = base*resolution[0];
    const height = base*resolution[1];
  
    const canvas = new Canvas(width, height)
      .printImage(background, 0, 0, width, height)
      .setGlobalAlpha(0.5)
      .setColor('#000000')
      .printRectangle(10, 10, width-20, height-20)
      .save()
  
      .setGlobalAlpha(1)
      .setColor(`#${message.db.user.color}`)
  
      .beginPath()
      .moveTo((width*75)/100, height+5)
      .lineTo(width+5, (height*20)/100)
      .setLineWidth(8)
      .stroke()
      .save()
  
      .beginPath()
      .moveTo((width*80)/100 , height+5)
      .lineTo(width+5, (height*35)/100)
      .setLineWidth(8)
      .stroke()
      .save()
  
      .setColor('#000000')
      .setGlobalAlpha(0.7)
      .printCircle(105, 105, 90)
      .setGlobalAlpha(1)
      .printCircularImage(pp, 101, 101, 85)
      .save()
  
      .setColor('#0E0E0E')
      .printRectangle(40, height-45, width-80, 25)
      .save()
  
      .setColor(`#${message.db.user.color}`)
      .setTextFont('15px "Comfortaa"')
      .printText(`${parseNum(level.xp)}/${parseNum(level.next)}`, 50, height-27)
      .save()
  
      .setColor(`#${message.db.user.color}`)
      .printRoundedRectangle(125, height-40, level.ratio*(width-170), 15, 50)
      .save()
  
      .setColor('#E5E5E5')
      .setTextFont(`${50-1*message.author.username.length}px "Comfortaa"`)
      .printText(message.author.username, 200, 65)
      .save()
  
      .setTextFont('20px "Comfortaa"')
      .printText(`Lvl ${level.lvl} • ${message.guild.name}`, 160, 195)
      .save()
  
      .toBuffer();

    const form = new FormData();

    form.append(`rank-${message.author.id}.png`, canvas, `rank-${message.author.id}.png`);

    message.channel.createMessage({
      data: form,
      headers: {
        ...form.getHeaders(),
      },
    });
  };
};

module.exports = exports = Rank;
