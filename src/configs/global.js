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
  listAccountTypes   : () => { 
    //return [bank.ACCOUNT_TYPE_PERSONAL, bank.ACCOUNT_TYPE_BUSINESS, bank.ACCOUNT_TYPE_FOUNDATION, bank.ACCOUNT_TYPE_BANKADMIN];
    return bank.ACCOUNT_TYPES.filter((item, idx) => idx>0);
  } ,
  newAccountTypesOptions : () =>{
    return [
        {  
          title : 'Personal Account',
          key: bank.ACCOUNT_TYPE_PERSONAL
        },
        {
          title : 'Business Account',
          key: bank.ACCOUNT_TYPE_BUSINESS
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
  endpoint                    : base_url+ api_version
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
  , TYPE_REFUND               : 'type_refund'
  , TYPE_RECEIVE              : 'type_receive'
  , TYPE_UNKNOWN              : 'type_unknown'

  , TYPE_NEW_ACCOUNT          : 'type_new_account'
  , TYPE_UPSERT_CUST          : 'type_upsert_cust'
  , TYPE_ERASE_CUST           : 'type_erase_cust'
  , TYPE_UPSERT_PAP           : 'type_upsert_pap'
  , TYPE_ERASE_PAP            : 'type_erase_pap'
  , TYPE_CHARGE_PAP           : 'type_charge_pap'

  , typeToText : (request_type) => {
      const types = {
        [api.TYPE_DEPOSIT]     : 'deposit', 
        [api.TYPE_EXCHANGE]    : 'exchange', 
        [api.TYPE_PAYMENT]     : 'payment', 
        [api.TYPE_PROVIDER]    : 'provider payment', 
        [api.TYPE_SEND]        : 'send', 
        [api.TYPE_WITHDRAW]    : 'withdraw', 
        [api.TYPE_SERVICE]     : 'service provisioning'
      } 
      const ret = types[request_type];
      return ret?ret:request_type;
    }
  , isDeposit          : (request) => { return (request.tx_type==api.TYPE_DEPOSIT||request.requested_type==api.TYPE_DEPOSIT)}
  , isIKDeposit        : (request) => { return (api.isDeposit(request) && request.deposit_currency==api.FIAT_CURR_IK)}
  , isBRLDeposit       : (request) => { return (api.isDeposit(request) && request.deposit_currency==api.FIAT_CURR_BRL)}
  , isWithdraw         : (request) => { return (request.tx_type==api.TYPE_WITHDRAW||request.requested_type==api.TYPE_WITHDRAW)}
  , isProviderPayment  : (request) => { return (request.tx_type==api.TYPE_PROVIDER||request.requested_type==api.TYPE_PROVIDER)}
  , isExchange         : (request) => { return (request.tx_type==api.TYPE_EXCHANGE||request.requested_type==api.TYPE_EXCHANGE)}
  , isService          : (request) => { return (request.tx_type==api.TYPE_SERVICE||request.requested_type==api.TYPE_SERVICE)}
  , getTypes           : () => { return [ api.TYPE_DEPOSIT, api.TYPE_EXCHANGE, api.TYPE_PAYMENT, api.TYPE_PROVIDER, api.TYPE_SEND, api.TYPE_WITHDRAW, api.TYPE_SERVICE];}
  , STATE_REQUESTED             : 'state_requested'
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
        [api.STATE_REQUESTED]        : '#2BBBAD', //'#fa8c16', 
        [api.STATE_PROCESSING]       : '#00695c', //'#acd126', 
        [api.STATE_ACCEPTED]         : '#00C851', //'#70d147', 
        
        [api.STATE_REFUNDED]         : '#aa66cc', //'red', //'#2f54eb', //'geekblue',
        [api.STATE_REVERTED]         : '#9933CC', // 'red', //'#2f54eb', //'geekblue',

        [api.STATE_REJECTED]         : '#CC0000', //'red', 
        [api.STATE_ERROR]            : '#CC0000', //'red', 

        [api.STATE_CANCELED]         : '#ff4444', //'#fa541c',

        [api.STATE_VIRTUAL_PENDING]  : '#ffbb33'
      } 
      return states[request_state] || 'gray';
    }
  , getStates           : () => { return [api.STATE_REQUESTED, api.STATE_PROCESSING, api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_ERROR, api.STATE_REFUNDED, api.STATE_REVERTED, api.STATE_CANCELED];}
  , isOnBlockchain      : (request) => {
      return api.getTXId(request);
    }
  , getTXId      : (request) => {
      return request.tx_id || request.transaction_id;
    }
  , isFinished         : (request) => {
      return [api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_REVERTED, api.STATE_REFUNDED, api.STATE_ERROR].includes(request.state);
    }
  , isProcessing       : (request) => {
      return [api.STATE_PROCESSING].indexOf(request.state)>=0;
    }
  , successfulEnding       : (request) => {
      return [api.STATE_ACCEPTED].includes(request.state);
    }
  , canCancel          : (request) => {
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
  , canAddAttachment  : (request) => {
      return [api.TYPE_EXCHANGE, api.TYPE_PROVIDER].includes(request.tx_type);
    }
  , isProcessPending   : (request) => {
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
  , onOkPath   : (request) => {
      return ![api.STATE_REJECTED, api.STATE_REVERTED, api.STATE_REFUNDED, api.STATE_ERROR, api.STATE_CANCELED].includes(request.state);
    }
  
  , TRANSFER_REASON:                    'tx_r'
  , TRANSFER_REASON_DISTRIBUTE_PROFIT : 'tx_r_distribute_profit'
  , TRANSFER_REASON_ADJUSTMENT :        'tx_r_adjustment'
  , TRANSFER_REASON_RENT :              'tx_r_rent'
  , TRANSFER_REASON_INVESTMENT :        'tx_r_investment'
  , TRANSFER_REASON_SUPPLIES :          'tx_r_supplies'
  , TRANSFER_REASON_ANOTHER :           'tx_r_another'
  , getTransferReasons : () => {
    return {[api.TRANSFER_REASON] : { 
                  title : 'Transfer reason'
                  , options: [
                    { 
                      key: api.TRANSFER_REASON_DISTRIBUTE_PROFIT,
                      label: 'Repasse Lucro'
                    },
                    { 
                      key: api.TRANSFER_REASON_ADJUSTMENT,
                      label: 'Repasse Ajuste'
                    },
                    { 
                      key: api.TRANSFER_REASON_RENT,
                      label: 'Aluguel'
                    },
                    { 
                      key: api.TRANSFER_REASON_INVESTMENT,
                      label: 'Investimento'
                    },
                    { 
                      key: api.TRANSFER_REASON_SUPPLIES,
                      label: 'Insumos'
                    },
                    { 
                      key: api.TRANSFER_REASON_ANOTHER,
                      label: 'Another...'
                    },
                  ]
                }}
  }
  , PAYMENT_VEHICLE               : 'payment_vehicle'
  , PAYMENT_VEHICLE_INKIRI        : 'payment_vehicle_inkiri'
  , PAYMENT_VEHICLE_INSTITUTO     : 'payment_vehicle_institute'

  , PAYMENT_CATEGORY              : 'payment_category'
  , PAYMENT_CATEGORY_ALUGEL       : 'payment_category_alugel'
  , PAYMENT_CATEGORY_INVESTIMENTO : 'payment_category_investimento'
  , PAYMENT_CATEGORY_INSUMOS      : 'payment_category_insumos'
  , PAYMENT_CATEGORY_ANOTHER      : 'payment_category_another'

  , PAYMENT_TYPE                  : 'payment_type'
  , PAYMENT_TYPE_DESPESA          : 'payment_type_despesa'
  , PAYMENT_TYPE_INVESTIMENTO     : 'payment_type_investimento'

  , PAYMENT_MODE                  : 'payment_mode'
  , PAYMENT_MODE_TRANSFER         : 'payment_mode_transfer'
  , PAYMENT_MODE_BOLETO           : 'payment_mode_boleto'

  , getPaymentOptions             : () => {
      return {
                [api.PAYMENT_VEHICLE] : { 
                  title : 'Pagamento via'
                  , options: [
                    {
                      key: api.PAYMENT_VEHICLE_INKIRI,
                      label:'Inkiri'
                    }, 
                    {
                      key: api.PAYMENT_VEHICLE_INSTITUTO,
                      label:'Instituto'
                    }
                  ]
                }
                , [api.PAYMENT_CATEGORY] : { 
                  title : 'Category'
                  , options: [
                    {
                      key: api.PAYMENT_CATEGORY_ALUGEL,
                      label:'Alugel'
                    }, 
                    {
                      key: api.PAYMENT_CATEGORY_INVESTIMENTO,
                      label:'Investimento'
                    }, 
                    {
                      key: api.PAYMENT_CATEGORY_INSUMOS,
                      label:'Insumos'
                    }, 
                    {
                      key: api.PAYMENT_CATEGORY_ANOTHER,
                      label:'Another...'
                    }
                  ]
                }
                , [api.PAYMENT_TYPE] : { 
                  title : 'Tipo saida'
                  , options: [
                    {
                      key: api.PAYMENT_TYPE_DESPESA,
                      label:'Despesa'
                    }, 
                    {
                      key: api.PAYMENT_TYPE_INVESTIMENTO,
                      label:'Investimento'
                    }
                  ]
                }
                , [api.PAYMENT_MODE] : { 
                  title : 'Modo de Pagamento'
                  , options: [
                    {
                      key: api.PAYMENT_MODE_TRANSFER,
                      label:'Bank transfer'
                    }, 
                    {
                      key: api.PAYMENT_MODE_BOLETO,
                      label:'Boleto Pagamento'
                    }
                  ]
                }
      }
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
  endpoint       : 'https://jungle2.cryptolions.io:443',
  node           : 'https://proxy.eosnode.tools/',
  create_account : 'https://api.monitor.jungletestnet.io/#account',
  // create_account: 'https://eos-account-creator.com/choose/'
  security_prefix: '1nK1r1_K3y_Pr3F1x_',
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
