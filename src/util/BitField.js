'use strict';

class BitField {
  constructor(bit = 0, flags) {
    this.bit = bit;
    
    this.flags = flags;
  };

  resolve(bit = this.bit, field = []) {
    if (Array.isArray(bit)) return this.resolve(bit.reduce((a, b) => a | b), []);
    if (bit <= 0) return field;
    let find = false;
    let i = 0;
    const entries = Object.entries(this.flags);
    let calc;
    while(!find) {
      calc = entries[entries.length-1-i];
      if ((bit - calc[1]) >= 0) {
        find = true;
      } else i++;
    };
    field.push(calc[0]);
    return this.resolve(bit - calc[1], field);
  };
};

module.exports = exports = BitField;