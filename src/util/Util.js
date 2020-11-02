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
};

module.exports = exports = Util;
