'use strict';

const express = require('express');
const http = require('http');
const app = express();
const {Canvas, resolveImage} = require('canvas-constructor');
const {registerFont} = require('canvas');
const path = require('path');
const {parseNum} = require('../../src/util/Util');

registerFont('./assets/fonts/Comfortaa/static/Comfortaa-Regular.ttf', { family: 'Comfortaa' });

async function sandbox() {
  const background = await resolveImage(path.resolve(path.join(__dirname, '/test-1.jpg')));
  const pp = await resolveImage(path.resolve(path.join(__dirname, '/pp.png')));

  const guild = "Shaynlink";
  const color = "#C133C8";
  const member = "13";

  const resolution = [16, 6];
  const base = 40;
  const width = base*resolution[0];
  const height = base*resolution[1];

  return new Canvas(width, height)
    .printImage(background, 0, 0, width, height)
    .setGlobalAlpha(0.5)
    .setColor('#000000')
    .printRectangle(10 ,10, width-20, height-20)
    .save()

    .setGlobalAlpha(0.5)
    .setColor(color)

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

    .setGlobalAlpha(1)
    .printCircularImage(pp, 101, height/2, 60)
    .save()

    .setColor('#E5E5E5')

    .setTextFont('80px "Comfortaa"')
    .printText('Welcome', width/3, height/2.2)
    .save()

    .setColor(color)
    .setTextFont(`${100-4*guild.length}px "Comfortaa"`)
    .printText(guild, width/2.8, height/1.2)
    .save()

    .toBuffer();
};

app.get('/sandbox', async (req, res) => {
  res.setHeader('Content-Type', 'image/png');

  res.end(await sandbox());
});

http.createServer(app).listen('3000');