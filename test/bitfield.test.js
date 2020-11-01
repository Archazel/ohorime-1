'use strict';

class BitField {
  constructor(bit = 0, flags) {
    this.bit = bit;
    
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
    bit = this.parse(bit);
    return (bit & flag) == flag;
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

console.log(myFlags1.resolve());
console.log(myFlags2.resolve());
console.log(myFlags3.resolve());

console.log(myFlags1.has(flags.a));
console.log(myFlags1.has(flags.b));