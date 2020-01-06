// import ecc, {PrivateKey, PublicKey, Signature, Aes, key_utils, config} from 'eosjs-ecc';
import ecc from 'eosjs-ecc';

export const generateRandomKeys = () =>   new Promise((res,rej)=> {
    
      ecc.randomKey().then((privateKey) => {
        
        let pubkey  = ecc.privateToPublic(privateKey); 
        // console.log('eosHelper::generateRandomKeys()\t')
        // console.log('Private Key:\t', privateKey) // wif
        // console.log('Public Key:\t', pubkey) // EOSkey...
        
        res({ data: {
            wif    : privateKey,
            pub_key : pubkey
          } 
        });

  })
})

export const privateToPublic = (wif) => ecc.privateToPublic(wif); 

export const seedPrivate = (secret_seed) =>   {
    let wif     = ecc.seedPrivate(secret_seed);
    let pubKey  = ecc.privateToPublic(wif); 
    
    // console.log('eosHelper::seedPrivate    ()\t')
    // console.log('param@Seed:\t', secret_seed)
    // console.log('Private Key:\t', wif)
    // console.log('Public Key:\t', pubKey) 
    
    return {
        wif:      wif,
        pub_key:  pubKey,
        seed:     secret_seed
      };
}

export const isValidPrivate = (wif) =>   {

    let isValid = ecc.isValidPrivate(wif);

    // console.log('eosHelper::isValidPrivate()\t')
    // console.log('param@wif:\t', wif)
    // console.log('isValid:\t', isValid) 

    return isValid;
}

export const isValidPublic = (pubKey) => {
    
    let isValid = ecc.isValidPublic(pubKey)
    
    // console.log('eosHelper::isValidPublic()\t')
    // console.log('param@wif:\t', pubKey)
    // console.log('isValid:\t', isValid) 

    return isValid;
}

export const signString = (wif, stringUtf8Data) =>   new Promise((res,rej)=> {
    
    let signedData = ecc.sign(stringUtf8Data , wif)
    
    // console.log('eosHelper::signString()\t')
    // console.log('param@wif:\t', wif)
    // console.log('param@stringUtf8Data:\t', stringUtf8Data)
    // console.log('signedData:\t', signedData) 

    res({ data: {
            signed_data : signedData 
          } 
    });
})

export const signHash = (wif, dataSha256Hex) =>   new Promise((res,rej)=> {
    
    let signedHash = ecc.signHash(dataSha256Hex , wif)
    
    // console.log('eosHelper::signHash()\t')
    // console.log('param@wif:\t', wif)
    // console.log('param@dataSha256Hex:\t', dataSha256Hex)
    // console.log('signedData:\t', signedHash) 

    res({ data: {
          signed_hash : signedHash
        } 
    });
})

export const sha256 = (stringHexData) =>   new Promise((res,rej)=> {
    
    let hashedData = ecc.sha256(stringHexData)
    // ecc.sha256(Buffer.from('02208b', 'hex')) === '29a23..'

    // console.log('eosHelper::sha256()\t')
    // console.log('param@stringHexData:\t', stringHexData)
    // console.log('hashedData:\t', hashedData) 

    res({ data: {
      hashed_data : hashedData
    } });
})


export const verify = (signedData, stringData, pubkey ) =>   new Promise((res,rej)=> {
    
    let verified = ecc.verify(signedData, stringData, pubkey)

    // console.log('eosHelper::verify()\t')
    // console.log('param@signedData:\t', signedData)
    // console.log('param@stringData:\t', stringData)
    // console.log('param@pubkey:\t', pubkey)
    // console.log('verified:\t', verified) 

    res({ data: {
      verified : verified
    } });
})

// ecc.recover(signature, stringUtf8Data) === pubkey
// ecc.recoverHash(signature, dataSha256) === pubkey

export const recover = (signedData, stringData, is_hash) =>   new Promise((res,rej)=> {

    let recovered = '';
    if(is_hash===true)
    {
      recovered = ecc.recoverHash(signedData, stringData)
    }
    else
    {  
      recovered = ecc.recover(signedData, stringData)
    }

    // console.log('eosHelper::recover()\t')
    // console.log('param@signedData:\t', signedData)
    // console.log('param@stringData:\t', stringData)
    // console.log('param@is_hash:\t', is_hash)
    // console.log('recovered:\t', recovered) 

    res({ data: {
      recovered : recovered,
      pub_key   : recovered,
      is_hash   : is_hash
    } });
})
