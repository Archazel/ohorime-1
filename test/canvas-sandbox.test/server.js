'use strict';

const express = require('express');
const http = require('http');
const app = express();
const { Canvas, resolveImage  } = require('canvas-constructor');
const {registerFont, loadImage} = require('canvas');
const path = require('path');
const {calculator, parseNum} = require('./../../src/util/Util');

registerFont('./assets/fonts/Comfortaa/static/Comfortaa-Regular.ttf', { family: 'Comfortaa' });

try {
  (async () => {
    console.log(await loadImage('https://lol.de').then(() => true).catch(() => false));
  })()
} catch (error) {
  console.log('e');
}

async function sandbox() {
  const background = await resolveImage(path.resolve(path.join(__dirname, '/test.jpg')));
  const pp = await resolveImage(path.resolve(path.join(__dirname, '/pp.png')));

  const messages = 1000000000;
  const level = calculator(messages);
  const myColor = '#C133C8';
  const username = 'shaynlink';
  const guildname = 'Ohorime sekai';
  
  const resolution = [16, 6];
  const base = 40;
  const width = base*resolution[0];
  const height = base*resolution[1];

  return new Canvas(width, height)
    .printImage(background, 0, 0, width, height)
    .setGlobalAlpha(0.5)
    .setColor('#000000')
    .printRectangle(10, 10, width-20, height-20)
    .save()

    .setGlobalAlpha(1)
    .setColor(myColor)

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

    .setColor(myColor)
    .setTextFont('15px "Comfortaa"')
    .printText(`${parseNum(level.xp)}/${parseNum(level.next)}`, 50, height-27)
    .save()

    .setColor(myColor)
    .printRoundedRectangle(125, height-40, level.ratio*(width-170), 15, 50)
    .save()

    .setColor('#E5E5E5')
    .setTextFont(`${50-1*username.length}px "Comfortaa"`)
    .printText(username, 200, 65)
    .save()

    .setTextFont('20px "Comfortaa"')
    .printText(`Lvl ${level.lvl} • ${guildname}`, 160, 195)
    .save()

    .toBuffer();
};

app.get('/sandbox', async (req, res) => {
  res.setHeader('Content-Type', 'image/png');

  res.end(await sandbox());
});

http.createServer(app).listen('3000');