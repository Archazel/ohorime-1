'use strict';

class BitField {
  constructor(bit = 0, flags) {
    this.bit = this.parse(bit);
    
    this.flags = flags;
  };

  parse(bit = this.bit) {
    if (Array.isArray(bit)) return bit.reduce((a, b) => a | b);
    else return bit;
  };

  resolve(bit = this.bit) {
    bit = this.parse(bit);
    const flags = {};
    for (const [key, value] of Object.entries(this.flags)) {
      flags[key] = (bit & value) == value 
    };
    return flags;
  };

  has(flag = 0, bit = this.bit) {
    if (typeof flag == 'string') {
      if (!this.flags[flag]) throw Error(`Invalid bitfield ${flag}`);
      return (bit &= this.flags[flag]) == this.flags[flag];
    } else {
      flag = this.parse(flag);
      return (bit &= flag) == flag;
    };
  };

  add(flag = 0, bit = this.bit) {
    if (typeof flag == 'string') {
      if (!this.flags[flag]) throw Error(`Invalid bitfield ${flag}`);
      return this.bit = bit | this.flags[flag];
    } else {
      flag = this.parse(flag);
      return this.bit = bit | flag;
    };
  };

  remove(flag = 0, bit = this.bit) {
    if (typeof flag == 'string') {
      if (!this.flags[flag]) throw Error(`Invalid bitfield ${flag}`);
      return this.bit = bit &= ~this.flags[flag];
    } else {
      flag = this.parse(flag);
      return this.bit = bit &= ~flag;
    };
  };
};

module.exports = exports = BitField;