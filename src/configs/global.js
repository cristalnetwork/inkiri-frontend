const env        = "dev";

const language   = "english";

const currency = {
  token:            "cristaltoken",
  issuer:           "cristaltoken",
  name:             "INKIRI",
  symbol:           "IK$",
  eos_symbol:       "INK",
  fiat:             {
                      symbol: "BRL$",
                      plural: "Reais"
                    },
  asset_precision:  4,

  toCurrencyString: (value) => { 
    const _value = currency.toNumber(value);
    return currency.symbol + ' ' + _value.toFixed(2) ; 
  },

  toNumber: (value) => 
  {
    if(!value)
      value=0;
    if(isNaN(value))
      value = Number(value.replace(currency.eos_symbol, ''));
    return parseFloat(value);
  },

  toEOSNumber: (amount) => 
  {
    return Number(amount).toFixed(4) + ' ' + currency.eos_symbol;
  }
};

const bank = {
  contract:                "cristaltoken",
  issuer:                  "cristaltoken",
  table_customers:         "customer", 
  table_customers_action:  "upsertcust",
  table_customers_delete:  "erasecust", 
  table_paps:              'pap',
  table_paps_action:       'upsertpap',
  table_paps_delete:       'erasepap', 
  table_paps_charge:       'chargepap',

  exchange_account:        "cristaltoken",
  provider_account:        "cristaltoken",
  withdraw_account:        "cristaltoken",
  
  customers:               'https://jungle.bloks.io/account/cristaltoken?loadContract=true&tab=Tables&account=cristaltoken&scope=cristaltoken&limit=100&table=customer',
  
  // HACK from server's config
  PAYMENT_VEHICLE_INKIRI :    'payment_vehicle_inkiri', //empresa
  PAYMENT_VEHICLE_INSTITUTE:  'payment_vehicle_institute',
  PAYMENT_MODE_TRANSFER:      'payment_mode_transfer',
  PAYMENT_MODE_BOLETO:        'payment_mode_boleto',

  ACCOUNT_TYPE_PERSONAL:   1,
  ACCOUNT_TYPE_BUSINESS:   2,
  ACCOUNT_TYPE_FOUNDATION: 3,
  ACCOUNT_TYPE_BANKADMIN:  4,
  ACCOUNT_TYPES:           ['none', 'personal', 'business', 'foundation', 'bankadmin'],
  // getAccountId : (account_string) =>{
  //   return bank.ACCOUNT_TYPES.indexOf(account_string);
  // },
  ACCOUNT_ICONS:           ['none', 'user', 'shop', 'home', 'bank'],
  getPermsForAccountType : (account_type) => {
   const perms = {
        [bank.ACCOUNT_TYPE_PERSONAL]     : ['owner', 'active', 'viewer']
        , [bank.ACCOUNT_TYPE_BUSINESS  ] : ['owner', 'active', 'pdv', 'viewer']
        , [bank.ACCOUNT_TYPE_FOUNDATION] : ['owner', 'active', 'viewer']
        , [bank.ACCOUNT_TYPE_BANKADMIN ] : ['owner', 'active', 'pda', 'viewer']
        }
    return perms[account_type];
  },
  isValidPermission : (account_type, required_permission, my_permission) => {
    const my_perms = bank.getPermsForAccountType(account_type);
    const required_permission_array = required_permission.split(',');
      
    if(required_permission_array.length==1)
    {
      const ret = my_perms.indexOf(required_permission_array[0]) >= my_perms.indexOf(my_permission);
      // console.log(required_permission, my_permission, ret)
      return ret;
    }

    const ret =  required_permission_array.includes(my_permission);
    // console.log(required_permission, my_permission, ret)
    return ret;

  },
  listAccountTypes   : () => { 
    //return [bank.ACCOUNT_TYPE_PERSONAL, bank.ACCOUNT_TYPE_BUSINESS, bank.ACCOUNT_TYPE_FOUNDATION, bank.ACCOUNT_TYPE_BANKADMIN];
    return bank.ACCOUNT_TYPES.filter((item, idx) => idx>0);
  } ,
  newAccountTypesOptions : () =>{
    return [
        {  
          title :       'Personal Account',
          title_i18n :  'global.personal_account',
          key:          bank.ACCOUNT_TYPE_PERSONAL
        },
        {
          title :       'Business Account',
          title_i18n :  'global.business_account',
          key:          bank.ACCOUNT_TYPE_BUSINESS
        },
        {
          title :       'Foundation Account',
          title_i18n :  'global.foundation_account',
          key:          bank.ACCOUNT_TYPE_FOUNDATION
        }
      ];
  },
  ACCOUNT_STATE_OK:        1,
  ACCOUNT_STATE_BLOCKED:   2,
  ACCOUNT_STATES:          ['none', 'ok', 'blocked'],
  listAccountStates  : () => { 
    return bank.ACCOUNT_STATES.filter((item, idx) => idx>0);
  } ,
  DEFAULT_FEE :            5,
  DEFAULT_OVERDRAFT:       0,
  
  getAccountState : (account_state) => {
    return (parseInt(account_state)<bank.ACCOUNT_STATES.length)?bank.ACCOUNT_STATES[parseInt(account_state)]:undefined;
  },
  getAccountType : (account_type) => {
      if(isNaN(account_type))
      return account_type;
    return (parseInt(account_type)<bank.ACCOUNT_TYPES.length)?bank.ACCOUNT_TYPES[parseInt(account_type)]:undefined;
  },
  isAccountOfType : (param, type_ref) => {
    if(typeof param !== 'number' && typeof param !== 'string')
      param = param.account_type  
    if(typeof param === 'number')
      return parseInt(param) == type_ref;
    return param == bank.ACCOUNT_TYPES[type_ref];
    
  },
  isPersonalAccount : (param) => {
    // if(typeof param !== 'number' && typeof param !== 'string')
    //   param = param.account_type  
    // return parseInt(param) == bank.ACCOUNT_TYPE_PERSONAL;
    return bank.isAccountOfType(param, bank.ACCOUNT_TYPE_PERSONAL)
  },
  isBusinessAccount : (param) => {
    // if(typeof param !== 'number' && typeof param !== 'string')
    //   param = param.account_type  
    // return parseInt(param) == bank.ACCOUNT_TYPE_BUSINESS;
    return bank.isAccountOfType(param, bank.ACCOUNT_TYPE_BUSINESS)
  },
  isFoundationAccount : (param) => {
    // if(typeof param !== 'number' && typeof param !== 'string')
    //   param = param.account_type  
    // return parseInt(param) == bank.ACCOUNT_TYPE_FOUNDATION;
    return bank.isAccountOfType(param, bank.ACCOUNT_TYPE_FOUNDATION)
  },
  isAdminAccount : (param) => {
    // if(typeof param !== 'number' && typeof param !== 'string')
    //   param = param.account_type  
    // return parseInt(param) == bank.ACCOUNT_TYPE_BANKADMIN;
    return bank.isAccountOfType(param, bank.ACCOUNT_TYPE_BANKADMIN)
  },
  isEnabledAccount : (account_state) => {
    return parseInt(account_state) == bank.ACCOUNT_STATE_OK;
  }
};


// const base_url    = env=='dev' ? 'http://localhost:3600' : 'https://cristal-backend.herokuapp.com';
const base_url    = env=='dev' ? 'http://localhost:3600' : 'https://cristaltoken.herokuapp.com';

const api_version = '/api/v1';
const api = {
  endpoint                    : base_url + api_version
  , graphql_endpoint          : base_url + api_version + '/graphql'
  , rem_generator_endpoint    : base_url + api_version + '/requests_rem_generator'
  , default_page_size         : 25
  , FIAT_CURR_BRL             : 'BRL'
  , FIAT_CURR_IK              : 'IK$'
  , fiatSymbolToMemo : (symbol) => {
    return symbol?symbol.replace('$', 'S').toLowerCase():'na'
  }
  , TYPE_DEPOSIT              : 'type_deposit'
  , TYPE_EXCHANGE             : 'type_exchange'
  , TYPE_PAYMENT              : 'type_payment'
  , TYPE_PROVIDER             : 'type_provider' 
  , TYPE_SEND                 : 'type_send'
  , TYPE_WITHDRAW             : 'type_withdraw' 
  , TYPE_SERVICE              : 'type_service'
  , TYPE_SALARY               : 'type_salary'
  , TYPE_ISSUE                : 'type_issue'
  , TYPE_IUGU                 : 'type_iugu'
  , TYPE_PAD                  : 'type_pad'

  , TYPE_REFUND               : 'type_refund'
  , TYPE_RECEIVE              : 'type_receive'
  , TYPE_UNKNOWN              : 'type_unknown'
  , TYPE_NEW_ACCOUNT          : 'type_new_account'
  , TYPE_UPSERT_CUST          : 'type_upsert_cust'
  , TYPE_ERASE_CUST           : 'type_erase_cust'
  , TYPE_UPSERT_PAP           : 'type_upsert_pap'
  , TYPE_ERASE_PAP            : 'type_erase_pap'
  , TYPE_CHARGE_PAP           : 'type_charge_pap'

  , isDeposit          : (request) => { return (request.tx_type==api.TYPE_DEPOSIT||request.requested_type==api.TYPE_DEPOSIT)}
  , isIKDeposit        : (request) => { return (api.isDeposit(request) && request.deposit_currency==api.FIAT_CURR_IK)}
  , isBRLDeposit       : (request) => { return (api.isDeposit(request) && request.deposit_currency==api.FIAT_CURR_BRL)}
  , isWithdraw         : (request) => { return (request.tx_type==api.TYPE_WITHDRAW||request.requested_type==api.TYPE_WITHDRAW)}
  , isProviderPayment  : (request) => { return (request.tx_type==api.TYPE_PROVIDER||request.requested_type==api.TYPE_PROVIDER)}
  , isExchange         : (request) => { return (request.tx_type==api.TYPE_EXCHANGE||request.requested_type==api.TYPE_EXCHANGE)}
  , isService          : (request) => { return (request.tx_type==api.TYPE_SERVICE||request.requested_type==api.TYPE_SERVICE)}
  , isSend             : (request) => { return (request.tx_type==api.TYPE_SEND||request.requested_type==api.TYPE_SEND)}
  , isPayment          : (request) => { return (request.tx_type==api.TYPE_PAYMENT||request.requested_type==api.TYPE_PAYMENT)}
  , isSalary           : (request) => { return (request.tx_type==api.TYPE_SALARY||request.requested_type==api.TYPE_SALARY)}
  , isSendOrPayment    : (request) => { return api.isPayment(request)||api.isSend(request)}
  , requiresAttach     : (request) => { 
      return [api.TYPE_EXCHANGE, api.TYPE_PROVIDER].includes(request.requested_type);
  }
  , requiresReception     : (request) => { 
      return [api.TYPE_EXCHANGE, api.TYPE_PROVIDER, api.TYPE_WITHDRAW].includes(request.requested_type);
  }
  , canRefund          : (request) => { 
      return [api.TYPE_EXCHANGE, api.TYPE_PROVIDER, api.TYPE_WITHDRAW].includes(request.requested_type);
  }
  , getTypes           : () => { 
    return [ api.TYPE_DEPOSIT, api.TYPE_EXCHANGE, api.TYPE_PAYMENT, api.TYPE_PROVIDER, api.TYPE_SEND, api.TYPE_WITHDRAW, api.TYPE_SERVICE, api.TYPE_PAD, api.TYPE_SALARY, api.TYPE_IUGU];
  }

  , STATE_REQUESTED             : 'state_requested'
  , STATE_RECEIVED              : 'state_received'
  , STATE_PROCESSING            : 'state_processing'
  , STATE_REJECTED              : 'state_rejected'
  , STATE_ACCEPTED              : 'state_accepted'
  , STATE_ERROR                 : 'state_error'
  , STATE_CANCELED              : 'state_canceled'
  , STATE_REFUNDED              : 'state_refunded'
  , STATE_REVERTED              : 'state_reverted'
  
  , STATE_VIRTUAL_PENDING       : 'state_virtual_pending'

  , stateToText : (request_state) => {
      const states = {
        [api.STATE_REQUESTED]      : 'requested', 
        [api.STATE_RECEIVED]       : 'received', 
        [api.STATE_PROCESSING]     : 'processing', 
        
        [api.STATE_ACCEPTED]       : 'accepted', 
        [api.STATE_REFUNDED]       : 'refunded',
        [api.STATE_REVERTED]       : 'reverted',
        
        [api.STATE_REJECTED]       : 'rejected', 
        [api.STATE_ERROR]          : 'error', 
        [api.STATE_CANCELED]       : 'canceled',

        [api.STATE_VIRTUAL_PENDING]: 'pending'
      }
      return states[request_state] || request_state;
    }
  , stateToColor : (request_state) => {
      // source: https://mdbootstrap.com/live/_doc/all-colors.html
      const states = {
        [api.STATE_REQUESTED]        : 'rgba(255, 255, 255, 1)'  , 

        [api.STATE_RECEIVED]         : 'rgba(255, 187, 51, 1)'  , 
        [api.STATE_PROCESSING]       : 'rgba(255, 187, 51, 1)'    , 

        [api.STATE_ACCEPTED]         : 'rgba(0, 200, 81, 0.75)'    , 
        
        [api.STATE_REFUNDED]         : 'rgba(255, 68, 68, 0.9)' , 
        [api.STATE_REVERTED]         : 'rgba(255, 68, 68, 0.9)'  , 

        [api.STATE_REJECTED]         : 'rgba(255, 68, 68, 0.9)'     , 
        [api.STATE_ERROR]            : 'rgba(255, 68, 68, 0.9)'     , 

        [api.STATE_CANCELED]         : 'rgba(255,68,68, 0.9)'   , 

        [api.STATE_VIRTUAL_PENDING]  : 'rgba(255, 187, 51, 0.5)' , 
      } 
      return states[request_state] ||  'rgba(80,80,80,0.5)' ;//'gray';
    }
  , getStates           : () => { return [api.STATE_REQUESTED, api.STATE_RECEIVED, api.STATE_PROCESSING, api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_ERROR, api.STATE_REFUNDED, api.STATE_REVERTED, api.STATE_CANCELED];}
  , isOnBlockchain      : (request) => {
      return api.getTXId(request);
    }
  , getTXId      : (request) => {
      return request.tx_id || request.transaction_id;
    }
  , isRequested         : (request) => {
    return api.STATE_REQUESTED == request.state;
  }
  , isFinished         : (request) => {
      return [api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_REVERTED, api.STATE_REFUNDED, api.STATE_ERROR, api.STATE_CANCELED].includes(request.state) 
        && request.flag.ok;
    }
  , isProcessing       : (request) => {
      return [api.STATE_PROCESSING].indexOf(request.state)>=0;
    }
  , successfulEnding       : (request) => {
      return [api.STATE_ACCEPTED].includes(request.state);
    }
  , canCancel          : (request) => {
      return [api.STATE_REQUESTED, api.STATE_RECEIVED].indexOf(request.state)>=0;
    }
  , canAddAttachment  : (request) => {
      return [api.TYPE_EXCHANGE, api.TYPE_PROVIDER].includes(request.tx_type);
    }
  , isProcessPending   : (request) => {
      return [api.STATE_REQUESTED, api.STATE_RECEIVED].indexOf(request.state)>=0;
    }
  , onOkPath   : (request) => {
      return ![api.STATE_REJECTED, api.STATE_REVERTED, api.STATE_REFUNDED, api.STATE_ERROR, api.STATE_CANCELED].includes(request.state);
    }
  
  , PAYMENT_VEHICLE               : 'payment_vehicle'
  , PAYMENT_CATEGORY              : 'payment_category'
  , PAYMENT_TYPE                  : 'payment_type'
  , PAYMENT_MODE                  : 'payment_mode'
  , getPaymentTitles : () => {
    return {
      [api.PAYMENT_VEHICLE]:   'Vehicle',
      [api.PAYMENT_CATEGORY]:  'Category',
      [api.PAYMENT_TYPE]:      'Type',
      [api.PAYMENT_MODE]:      'Mode',
    }
  }
  
  , IUGU_STATE_NOT_PROCESSED      : 'state_not_processed'
  , IUGU_STATE_PROCESSING         : 'state_processing'
  , IUGU_STATE_ISSUED             : 'state_issued'
  , IUGU_STATE_ERROR              : 'state_error'
  , IUGU_STATE_ISSUE_ERROR        : 'state_issue_error'
  , getIuguStates : () => {
    return [api.IUGU_STATE_NOT_PROCESSED, api.IUGU_STATE_PROCESSING, api.IUGU_STATE_ISSUED, api.IUGU_STATE_ERROR, api.IUGU_STATE_ISSUE_ERROR];
  }

  , NOTA_FISCAL                   : 'attach_nota_fiscal'
  , BOLETO_PAGAMENTO              : 'attach_boleto_pagamento'
  , COMPROBANTE                   : 'attach_comprobante'
};

// ToDo: Traer DFuse config from private server!
const dfuse = {
  api_key                   : 'web_8a50f2bc42c1df1a41830c359ba74240',
  // api_key                   : 'web_d171ffb1033789db684e7525782dbecf',
  network                   : 'jungle',
  auth_url                  : 'https://auth.dfuse.io/v1/auth/issue',
  base_url                  : 'https://jungle.eos.dfuse.io',
  chain_id                  : 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  websocket_url             : 'wss://jungle.eos.dfuse.io/v1/stream',
  default_page_size         : 25,
  tx_url                    : 'https://jungle.bloks.io/transaction/',
  account_url               : 'https://jungle.bloks.io/account/',
  getBlockExplorerTxLink : (tx_id) => {
    return dfuse.tx_url + tx_id;
  }
}

  /*
  * I should take a look at: https://api.monitor.jungletestnet.io/#apiendpoints
  */
const eos = {
  // endpoint       : env=='dev' ? 'http://127.0.0.1:8888' : 'https://jungle2.cryptolions.io:443',
  /* HACK */
  endpoint                  : 'https://jungle2.cryptolions.io:443',
  node                      : 'https://proxy.eosnode.tools/',
  push: {
    retries                 : 1,
    use_options             : true,
    options:  {
      blocksBehind          : 3,
      expireSeconds         : 60
    },
    breakable_error_codes   : [3081001]
  },
  create_account            : 'https://api.monitor.jungletestnet.io/#account',
  // create_account           : 'https://eos-account-creator.com/choose/'
  security_prefix           : '1nK1r1_K3y_Pr3F1x_',
  generateSeed : (account_name, seed) => {
    if(!account_name || account_name.trim()=='')
      throw new Error('Account name can not be empty');
    if(!seed || seed.trim()=='')
      throw new Error('Password can not be empty');
    // We should derivate several times for security reasons.
    return eos.security_prefix.trim() + account_name.trim() + seed.trim();
  }
}

export { language, api, currency, dfuse, bank, eos };
