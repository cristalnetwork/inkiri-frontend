import _ from 'lodash';

/*
  $ cleos --print-request -u http://jungle2.cryptolions.io:80  get account cristaltoken -j

  "permissions": [{
      "perm_name": "active",
      "parent": "owner",
      "required_auth": {
        "threshold": 1,
        "keys": [{
            "key": "EOS6QXzDHnA952Ym5eayML7SVxiWeDPEdVFEvxdHgWAdLE6vUTFaK",
            "weight": 1
          }
        ],
        "accounts": [{
            "permission": {
              "actor": "cristaltoken",
              "permission": "eosio.code"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "pessoalteste",
              "permission": "active"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "silvinadayan",
              "permission": "active"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "tutinopablo1",
              "permission": "active"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "wawrzeniakdi",
              "permission": "active"
            },
            "weight": 1
          }
        ],
        "waits": []
      }
    },{
      "perm_name": "owner",
      "parent": "",
      "required_auth": {
        "threshold": 1,
        "keys": [{
            "key": "EOS6QXzDHnA952Ym5eayML7SVxiWeDPEdVFEvxdHgWAdLE6vUTFaK",
            "weight": 1
          }
        ],
        "accounts": [{
            "permission": {
              "actor": "pessoalteste",
              "permission": "active"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "silvinadayan",
              "permission": "active"
            },
            "weight": 1
          },{
            "permission": {
              "actor": "wawrzeniakdi",
              "permission": "active"
            },
            "weight": 1
          }
        ],
        "waits": []
      }
    }
  ],
*/

const getPermissionWithEmptyKeys = (account, authority) => {
  let the_authority = account.permissions.filter( perm => perm.perm_name==authority )[0]
  let new_authority = Object.assign({}, the_authority);
  new_authority.required_auth.keys=[];
  return new_authority;
}

const getKeyPermission = (pub_key) =>{
  // Build new permission
  return {
    "key":       pub_key,
    "weight": 1
  };
}

const _authorities = ['active', 'owner']
// const _authorities = ['active']
export const overrideKeys = (account, permissioned_pub_key, authorities) =>{
  const my_authorities = authorities?authorities:_authorities;
  const permissions = my_authorities.map(
    (authority) => {
      const perm = getPermissionWithEmptyKeys(account, authority);
      const keys = getKeyPermission(permissioned_pub_key);
      perm.required_auth.keys.push(keys)
      return perm;
    });

  return permissions;
}

export const removeAccount = (account, authority, permissioned_account, permissioned_account_permission) => {
  
  let the_authority = account.permissions.find( perm => perm.perm_name==authority );
  let new_authority = Object.assign({}, the_authority); 
    
  // console.log('********** remove ACCOUNT ');
  // console.log('** account: ', account);
  // console.log('** permissioned_account: ', permissioned_account);
  // console.log('** authority: ', authority);
  // console.log('** authority obj: ', JSON.stringify(new_authority));

  new_authority.required_auth.accounts = new_authority.required_auth.accounts.filter( (p) => {
    return !(p.permission.actor === permissioned_account && p.permission.permission === permissioned_account_permission);
  })
  // _.remove(new_authority.required_auth.accounts, function(e) {
  //   console.log('e.permission.actor: ', e.permission.actor)
  //   console.log('permissioned_account: ', permissioned_account) 
  //   console.log('e.permission.permission: ', e.permission.permission)
  //   console.log('authority: ', authority)
  //   return e.permission.actor === permissioned_account && e.permission.permission === authority;
  // });
  return new_authority.required_auth;
}

export const addAccount = (account, permissioned_account, authority) =>{
  // Build new permission
  const new_perm = {
                    "permission":
                    {
                        "actor":       permissioned_account,
                        "permission":  "active"
                    },
                    "weight": 1
                };
  
  // If permission not in eos_account_obj, we create it 
  let perm = account.permissions.filter( perm => perm.perm_name==authority )
  if(!perm || perm.length==0)
  {
    perm = Object.assign({}, default_perm);
    perm.perm_name = authority;
    perm.required_auth.accounts.push(new_perm)
  }
  else
  {
    // Add permission and sort accounts array for created permission => authority   
    perm = perm[0];
    perm.required_auth.accounts.push(new_perm)
    const ordered = _.sortBy(perm.required_auth.accounts, function(perm) { return perm.permission.actor; })
    perm.required_auth.accounts = ordered;
  }
  return perm.required_auth;
}  

const default_perm = {
            "perm_name":       "",
            "parent":          "", 
            "required_auth":
            {
                "threshold":   1,
                "keys":        [],
                "accounts":    [],
                "waits":       []
            }
        }

export const getActions = (account_name, permissions) => { 
  return permissions.map( (perm, idx) => {
    // console.log(' ========== getActions:', idx, perm)
    return getAction(account_name, perm.perm_name, perm.required_auth);
  })
}

export const getAction = (account_name, permission_name, authority_obj, parent) => { 

  if(!parent && permission_name!='owner')
    parent='owner';
  else
    parent = '';


  const empty = ((!authority_obj.keys || authority_obj.keys.length==0) && (!authority_obj.accounts || authority_obj.accounts.length==0));

  let action_name = 'updateauth';
  let data        = {
      account    : account_name,
      permission : permission_name,
      auth       : authority_obj,
      parent     : parent
  }

  if(empty)
  {
    action_name = 'deleteauth';
    data        = {
      account:    account_name,
      permission: permission_name,
    }
  }

  const permAction = {
    account: 'eosio',
    name: action_name,
    authorization: [
      {
        actor: account_name,
        permission: "owner"
      }
    ],
    data: data
  }

  console.log(' getAction >> About to change permission >> ', JSON.stringify(permAction))
  return permAction;
}
