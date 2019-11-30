/* 
*
* Source: https://gist.github.com/MrToph/2634b81999357f34ff26f4c03a00fe0e 
*
*/

// Originally from https://raw.githubusercontent.com/EOSIO/eosjs/v16.0.9/src/format.js
// eosjs2 does not have this function

import Long from 'long';  

function bytesToHex(bytes) {
  let leHex = '';
  for (const b of bytes) {
    const n = Number(b).toString(16);
    leHex += (n.length === 1 ? '0' : '') + n;
  }
  return leHex;
}

const charmap = '.12345abcdefghijklmnopqrstuvwxyz';
const charidx = ch => {
  const idx = charmap.indexOf(ch);
  if (idx === -1) throw new TypeError(`Invalid character: '${ch}'`);

  return idx;
};

function nameToValue(name) {
  
  if (typeof name === 'number'){
    return Long.fromInt(name, false)  
  }

  if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

  if (name.length > 12) throw new TypeError('A name can be up to 12 characters long');

  let bitstr = '';
  for (let i = 0; i <= 12; i++) {
    // process all 64 bits (even if name is short)
    const c = i < name.length ? charidx(name[i]) : 0;
    const bitlen = i < 12 ? 5 : 4;
    let bits = Number(c).toString(2);
    if (bits.length > bitlen) {
      throw new TypeError('Invalid name ' + name);
    }
    bits = '0'.repeat(bitlen - bits.length) + bits;
    bitstr += bits;
  }

  return Long.fromString(bitstr, true, 2);
}

export function getTableBoundsForName(name, asHex, bigEndian) {
  const nameValue = nameToValue(name);
  const nameValueP1 = nameValue.add(1);


  if(!asHex && !bigEndian) {
    return {
      lower_bound: nameValue.toString(),
      upper_bound: nameValueP1.toString()
    };
  }
  
  if(!asHex && bigEndian==true)
  {
    const lBound = bytesToHex(nameValue.toBytesBE());
    const uBound = bytesToHex(nameValueP1.toBytesBE());
    return {
      lower_bound: lBound.toString(),
      upper_bound: uBound.toString(),
    };
  }
  // console.log('nameValue: ', nameValue)
  // console.log('nameValueP1: ', nameValueP1)
  // console.log('nameValue.toString(16): ', nameValue.toString(16))
  // console.log('nameValueP1.toString(16): ', nameValueP1.toString(16))
  // return {
  //   lower_bound: nameValue.toString(16),
  //   upper_bound: nameValueP1.toString(16),
  // };

  const lowerBound = bytesToHex(nameValue.toBytesLE());
  const upperBound = bytesToHex(nameValueP1.toBytesLE());
  return {
    lower_bound: lowerBound.toString(),
    upper_bound: upperBound.toString(),
  };
}

