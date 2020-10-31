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

const flags = {
  a: 1 << 0,
  b: 1 << 2,
  c: 1 << 3,
  d: 1 << 4,
  e: 1 << 5,
};

const myFlags1 = new BitField((flags.a | flags.c | flags.e), flags);
const myFlags2 = new BitField([flags.a, flags.b, flags.c], flags);
const myFlags3 = new BitField((flags.a | flags.b | flags.c | flags.d | flags.e), flags);

console.log(myFlags1.resolve(), myFlags2.resolve(), myFlags3.resolve());