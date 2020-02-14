/* 
*
* Source: https://gist.github.com/MrToph/2634b81999357f34ff26f4c03a00fe0e 
*
*/

// Originally from https://raw.githubusercontent.com/EOSIO/eosjs/v16.0.9/src/format.js
// eosjs2 does not have this function

import Long from 'long';  

const bytesToHex = (bytes) => {
  let leHex = '';
  for (const b of bytes) {
    const n = Number(b).toString(16);
    leHex += (n.length === 1 ? '0' : '') + n;
  }
  return leHex;
}

const charmap        = '.12345abcdefghijklmnopqrstuvwxyz';
const start_with_map = 'abcdefghijklmnopqrstuvwxyz';
const end_with_map   = '12345abcdefghijklmnopqrstuvwxyz';

const charidx = ch => {
  const idx = charmap.indexOf(ch);
  if (idx === -1) throw new TypeError(`Invalid character: '${ch}'`);

  return idx;
};

const emptyIfInvalid = (ch, map) => {
  const _charmap = map?map:charmap;
  const idx = _charmap.indexOf(ch);
  if (idx === -1) 
    return ''
  return ch;
};

export const leadingZeros = (s, n) => {
  if (typeof s !== 'string') 
    s=s.toString();
  if (typeof n !== 'number') n=16;
  return ('00000000000000000000'+s).slice(-n);
}

/*
* Converts name string to Number, in a UNSIGNED INT REPRESENTATION.  
*/
export function nameToValue(name) {
  
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

export function getTableBoundsForName2(name, asLittleEndianHex, step) {
  const my_step     = (typeof step === "undefined")?1:step;
  console.log('step: ', step, ' my_step:', my_step)
  const nameValue   = nameToValue(name);
  const nameValueP1 = nameValue.add(my_step);

  if(!asLittleEndianHex) {
    return {
      lower_bound: nameValue.toString(),
      upper_bound: nameValueP1.toString()
    };
  }

  const lowerBound = nameValue.toString(16); //bytesToHex(nameValue.toBytesLE());
  const upperBound = nameValueP1.toString(16); //bytesToHex(nameValueP1.toBytesLE());

  // console.log('name: ', name, 'nameValue: ', nameValue, 'nameHEX: ', lowerBound )
  
  return {
    lower_bound: lowerBound,
    upper_bound: upperBound,
  };
}

/*
* Standard Account Names
* Can only contain the characters .abcdefghijklmnopqrstuvwxyz12345. a-z (lowercase), 1-5 and . (period)
* Must start with a letter
* Must be 12 characters
* Must not end in a dot
* https://developers.eos.io/eosio-cpp/docs/naming-conventions
* (^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$) => https://github.com/EOSIO/eos/issues/955
*/
// export function generateAccountName(seed_array) {

//   console.log(' -- generateAccountName#1')
//   if(!seed_array || seed_array.length==0)
//     return '';

//   let name         = seed_array.join('') ;
//   let account_name = '';

//   // for (let i = 0; i < name.length; i++) {
//   //   account_name = account_name + emptyIfInvalid(name[i]);
//   // }

//   console.log(' -- generateAccountName#2')
//   account_name  = name.split('').map( _char => emptyIfInvalid(_char)).join('');
//   console.log(' -- generateAccountName#3')
//   while(account_name.length>0 && emptyIfInvalid(account_name.charAt(0), start_with_map) === '')
//   {
//     console.log(' -- generateAccountName#3.', account_name)
//     account_name = account_name.substr(1);
//   }
//   console.log(' -- generateAccountName#4')
//   account_name = (account_name + end_with_map).slice(0, 12);
//   console.log(' -- generateAccountName#5')
//   return account_name;
// }

// export const isValidAccountName = (name) => {
//   // const regEx = new RegExp("^([a-z1-5]){12,}$");
//   const regEx = new RegExp("(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)");
//   return (name.length == 12 && regEx.test(name)) 
  
// }