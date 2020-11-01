'use strict';

const {flags} = require('./Constant');

class Util {
  static randomString(len) {
    const letter = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let kio = '';
    for (let i = 0; i < len; i++) kio += letter[Math.floor(Math.random() * letter.length)];
    return kio;
  };

  static compute_base_permission(member, guild) {
    if (guild.owner_id == member.id) return flags.PERMISSION_ALL;

    const role_everyone = guild.roles.find((role) => role.name == '@everyone'); // get @everyone role
    let permissions = role_everyone.permissions;
    
    for (const role in member.roles) {
      permissions |= role.permissions;
    };

    if (permissions & flags.PERMISSION.ADMINISTRATOR) return flags.PERMISSION_ALL;

    return {permissions, role_everyone};
  };

  static compute_overwrites(base_permissions, member, channel, everyone_id) {
    if ((base_permissions & flags.PERMISSION.ADMINISTRATOR) == flags.PERMISSION.ADMINISTRATOR) return flags.PERMISSION_ALL;

    const permissions = base_permissions;
    const overwrite_everyone = channel.permission_overwrites.find((overwrite) => overwrite.id == everyone_id);

    if (overwrite_everyone) {
      permissions &= ~overwrite_everyone.deny;
      permissions |= overwrite_everyone.deny;
    };

    const overwrites = channel.permission_overwrites;
    let allow = 0;
    let deny = 0;
    for (const role in member.roles) {
      const overwrite_role = overwrites.find((overwrite) => overwrite.id = role.id);
      if (overwrite_role) {
        allow |= overwrite_role.allow;
        deny |= overwrite_role.deny;
      };
    };
    permissions &= ~deny;
    permissions |= allow;

    overwrite_member = overwrites.find((overwrite) => overwrite.id == member.id);

    if (overwrite_member) {
      permissions &= ~overwrite_member.deny
      permissions |= overwrite_member.allow
    };

    return permissions;
  };

  static compute_permissions(member, guild, channel) {
    const base_permissions = this.compute_base_permission(member, guild);
    return this.compute_overwrites(base_permissions.permissions, member, channel, base_permissions.role_everyone.id);
  };
};

module.exports = exports = Util;
