
import ecc from 'eosjs-ecc';
import hdkey from 'hdkey';
import wif from 'wif';
import * as eosHelper from './eos-helper';
const derivation_path = "m/44'/194'/0'/0/0";
const loop_count      = 10;

export const getKey = (account_name, password, do_log=false) =>{
  const seed        = account_name + '.' + password;
  let private_key = ecc.seedPrivate(seed)
  for(var i=0; i<100000;i++){
    private_key = ecc.seedPrivate(private_key)
  }
  const pub_key =  ecc.privateToPublic(private_key).toString();
  do_log  && console.log("publicKey: "  +  pub_key)
  do_log  && console.log("privateKey: " +  private_key)
  return {
    wif:      private_key,
    pub_key:  pub_key
  };
}

export const getDerivedKey = (account_name, password, do_log=false) =>{
  const seed      = account_name + '.' + password;
  let private_key = ecc.seedPrivate(seed);
  let master      = hdkey.fromMasterSeed(Buffer.from(ecc.sha256(private_key.toString()), 'hex'));
  let node        = master.derive(derivation_path); 
  for(var i=0; i<loop_count;i++){
    master = hdkey.fromMasterSeed(node.privateExtendedKey);
    node   = master.derive(derivation_path);  
  }
  const pub_key = ecc.PublicKey(node._publicKey).toString();
  const _wif = wif.encode(128, node._privateKey, false);
  do_log  && console.log("publicKey: "  +  pub_key)
  do_log  && console.log("privateKey: " +  _wif)
  return {
    wif:      _wif,
    pub_key:  pub_key
  };
}

export const getDerivedKeyOLD  = (account_name, password, do_log=false) =>{
  const seed = generateSeed (account_name, password);
  return eosHelper.seedPrivate(seed);
}

const security_prefix = '1nK1r1_K3y_Pr3F1x_';
const generateSeed = (account_name, seed) => {
  if(!account_name || account_name.trim()=='')
    throw new Error('Account name can not be empty');
  if(!seed || seed.trim()=='')
    throw new Error('Password can not be empty');
  // We should derivate several times for security reasons.
  return security_prefix.trim() + account_name.trim() + seed.trim();
}