'use strict';

const {flags} = require('./Constant');

class Util {
  static randomString(len) {
    const letter = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let kio = '';
    for (let i = 0; i < len; i++) kio += letter[Math.floor(Math.random() * letter.length)];
    return kio;
  };

  static computeBasePermissions(member, guild) {
    if (member.id == guild.owner_id) return flags.PERMISSION_ALL;
    
    const role_everyone = guild.roles.find((role) => role.name == '@everyone');
    let permissions = role_everyone.permissions;

    for (let role of member.roles) {
      role = guild.roles.find((_role) => _role.id == role);
      permissions |= role.permissions;
    };

    if ((permissions & flags.ADMINISTRATOR) == flags.ADMINISTRATOR) return flags.PERMISSION_ALL;

    return permissions;
  };
  
  static computeOverwrites(basePermissions, member, guild, channel) {
    if ((basePermissions & flags.ADMINISTRATOR) == flags.ADMINISTRATOR) return flags.PERMISSION_ALL;

    let permissions = basePermissions;
    const role_everyone = guild.roles.find((role) => role.name == '@everyone');
    const overwrite_everyone = channel.permission_overwrites.find((overwrite) => overwrite.id == role_everyone.id);
    if (overwrite_everyone) {
      permissions &= ~overwrite_everyone.deny;
      permissions |= overwrite_everyone.allow;
    };

    const overwrites = channel.permission_overwrites;
    let allow = null;
    let deny = null;
    for (const role_id of member.roles) {
      const overwrite_role = overwrites.find((overwrite) => overwrite.id == role_id);
      if (overwrite_role) {
        allow |= overwrite_role.allow;
        deny |= overwrite_role.deny;
      };
    };

    permissions &= ~deny;
    permissions |= allow;

    const overwrite_member = overwrites.find((overwrite) => overwrite.id == member.id);

    if (overwrite_member) {
      permissions &= ~overwrite_member.deny;
      permissions |= overwrite_member.allow;
    };

    return permissions;
  };

  static computePermissions(member, guild, channel) {
    const basePermissions = Util.computeBasePermissions(member, guild);
    return Util.computeOverwrites(basePermissions, member, guild, channel);
  };

  static parseMention(str) {
    if (!str) return null;
    if (Array.isArray(str)) str = str.join('');
    const mentions = [
      {tag: 'nickname', reg: /<@!(\w{1,20})>/},
      {tag: 'channel', reg: /<#(\w{1,20})>/},
      {tag: 'username', reg: /<@(\w{1,20})>/},
      {tag: 'role', reg: /<@&(\w{1,20})>/},
      {tag: 'emoji', reg: /<(:a:)?:(\w{1,20}):(\w{1,20})>/},
    ];
    
    let matchs = {};
    
    for (const mention of mentions) {
      if (!matchs[mention.tag]) matchs[mention.tag] = [];
      if (str.match(mention.reg)) {
        matchs[mention.tag].push(...str.match(mention.reg));
      };
    };
    
    return matchs;
  };

  static calculator(xp) {
    const algo = {
        xp,
        difficulty: 125,
        lvl: 0,
        next: 0,
        _last: 0,
        ratio: 0,
    };
    algo.lvl = Math.ceil(algo.xp / algo.difficulty);
    algo.next = algo.lvl * algo.difficulty;
    algo._last = (algo.lvl - 1) * algo.difficulty;
    algo.ratio = (algo.xp - algo._last) / (algo.next - algo._last);

    return algo;
  };

  static removeEnd(str, lgt) {
    let arr = str.split('');
    for (let i = 0; i < lgt; i++) {
      arr.pop();
    };
    return arr.join('');
  };

  static parseNum(num) {
    num = parseInt(num);
    if (num < 1000) return num;
    else if (num < 1000000 && num > 999) return `${Util.removeEnd(String(num), 3)}k`;
    else if (num < 1000000000 && num > 999999) return `${Util.removeEnd(String(num), 6)}M`;
    else if (num < 1000000000000 && num > 999999999) return `${Util.removeEnd(String(num), 9)}B`;
    else `${Util.removeEnd(String(num), 12)}`;
  };

  static createUUID() {
    const schema = [8, 4, 4, 4, 12];
    let content = 'abcdefghijklmopqrstuvwxyz0123456789';
    let uuid = '';
    for (const lgt of schema) {
      uuid += '-';
      for (let i = 0; i < lgt; i++) {
        uuid += content[Math.floor(Math.random() * content.length)];
      };
    };
    return uuid.slice(1);
  };
};

module.exports = exports = Util;
