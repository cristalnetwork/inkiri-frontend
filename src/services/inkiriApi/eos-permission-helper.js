import _ from 'lodash';

export const removeAccount = (account, permissioned_account, authority) => {
  let the_authority = account.permission.filter( perm => perm.perm_name==authority )[0]
  let new_authority = Object.assign({}, the_authority); 
  _.remove(new_authority.required_auth.accounts, function(e) {
    return e.permission.actor === permissioned_account && e.permission.permission === authority;
  });
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
            "perm_name": "active",
            "parent": "", //"parent": "owner",
            "required_auth":
            {
                "threshold": 1,
                "keys": [],
                "accounts": [],
                "waits": []
            }
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

  // console.log(' InkiriApi::permAction >> About to change permission >> ', JSON.stringify(permAction))
  return permAction;
}
