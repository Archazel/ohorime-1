'use strict';

class Util {
  static randomString(len) {
    const letter = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let kio = '';
    for (let i = 0; i < len; i++) kio += letter[Math.floor(Math.random() * letter.length)];
    return kio;
  };
};

module.exports = exports = Util;
