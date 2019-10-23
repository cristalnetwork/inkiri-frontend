const env        = "dev";

const language   = "english";


const currency = {
  token:            "inkiritoken1",
  issuer:           "inkiritoken1",
  name:             "INKIRI",
  symbol:           "IK$",
  eos_symbol:       "INK",
  fiat:             {
                      symbol: "BRL$",
                      plural: "Reais"
                    },
  asset_precision:  4,

  toCurrencyString: (value) => { return currency.symbol + ' ' + parseFloat(isNaN(value)?0:value) ; }
};

const bank = {
  contract:                "inkirimaster",
  issuer:                  "inkirimaster",

  exchange_account:        "inkirimaster",
  provider_account:        "inkirimaster",

  customers:               'https://jungle.bloks.io/account/inkirimaster?loadContract=true&tab=Tables&account=inkirimaster&scope=inkirimaster&limit=100',
  ACCOUNT_TYPE_PERSONAL:   1,
  ACCOUNT_TYPE_BUSINESS:   2,
  ACCOUNT_TYPE_FOUNDATION: 3,
  ACCOUNT_TYPE_BANKADMIN:  4,
  ACCOUNT_TYPES:           ['none', 'personal', 'business', 'foundation', 'bankadmin'],
  // getAccountId : (account_string) =>{
  //   return bank.ACCOUNT_TYPES.indexOf(account_string);
  // },
  ACCOUNT_ICONS:           ['none', 'user', 'shop', 'home', 'bank'],
  listPermsByAccountType : () => {
   return {
        [bank.ACCOUNT_TYPE_PERSONAL]     : ['owner', 'active', 'viewer']
        , [bank.ACCOUNT_TYPE_BUSINESS  ] : ['owner', 'active', 'pdv', 'viewer']
        , [bank.ACCOUNT_TYPE_FOUNDATION] : ['owner', 'active', 'viewer']
        , [bank.ACCOUNT_TYPE_BANKADMIN ] : ['owner', 'active', 'pda', 'viewer']
        }
  },
  listAccountTypes   : () => { 
    //return [bank.ACCOUNT_TYPE_PERSONAL, bank.ACCOUNT_TYPE_BUSINESS, bank.ACCOUNT_TYPE_FOUNDATION, bank.ACCOUNT_TYPE_BANKADMIN];
    return bank.ACCOUNT_TYPES.filter((item, idx) => idx>0);
  } ,
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
    return (parseInt(account_type)<bank.ACCOUNT_TYPES.length)?bank.ACCOUNT_TYPES[parseInt(account_type)]:undefined;
  },
  isPersonalAccount : (param) => {
    if(typeof param !== 'number' && typeof param !== 'string')
      param = param.account_type  
    return parseInt(param) == bank.ACCOUNT_TYPE_PERSONAL;
    
  },
  isBusinessAccount : (param) => {
    if(typeof param !== 'number' && typeof param !== 'string')
      param = param.account_type  
    return parseInt(param) == bank.ACCOUNT_TYPE_BUSINESS;
  },
  isFoundationAccount : (param) => {
    if(typeof param !== 'number' && typeof param !== 'string')
      param = param.account_type  
    return parseInt(param) == bank.ACCOUNT_TYPE_FOUNDATION;
  },
  isAdminAccount : (param) => {
    if(typeof param !== 'number' && typeof param !== 'string')
      param = param.account_type  
    return parseInt(param) == bank.ACCOUNT_TYPE_BANKADMIN;
  },
  isEnabledAccount : (account_state) => {
    return parseInt(account_state) == bank.ACCOUNT_STATE_OK;
  }
};


const base_url    = env=='dev' ? 'http://localhost:3600' : 'https://cristal-backend.herokuapp.com';

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
  , typeToText : (request_type) => {
      const types = {
        [api.TYPE_DEPOSIT]     : 'deposit', 
        [api.TYPE_EXCHANGE]    : 'exchange', 
        [api.TYPE_PAYMENT]     : 'payment', 
        [api.TYPE_PROVIDER]    : 'provider payment', 
        [api.TYPE_SEND]        : 'send', 
        [api.TYPE_WITHDRAW]    : 'withdraw', 
        [api.TYPE_SERVICE]     : 'service payment'
      } 
      return types[request_type];
    }
  , isDeposit          : (request) => { return (request.tx_type==api.TYPE_DEPOSIT)}
  , isIKDeposit        : (request) => { return (request.tx_type==api.TYPE_DEPOSIT && request.deposit_currency==api.FIAT_CURR_IK)}
  , isBRLDeposit       : (request) => { return (request.tx_type==api.TYPE_DEPOSIT && request.deposit_currency==api.FIAT_CURR_BRL)}
  , isWithdraw         : (request) => { return (request.tx_type==api.TYPE_WITHDRAW)}
  , isProviderPayment  : (request) => { return (request.tx_type==api.TYPE_PROVIDER)}
  , isExchange         : (request) => { return (request.tx_type==api.TYPE_EXCHANGE)}
  , getTypes           : () => { return [ api.TYPE_DEPOSIT, api.TYPE_EXCHANGE, api.TYPE_PAYMENT, api.TYPE_PROVIDER, api.TYPE_SEND, api.TYPE_WITHDRAW, api.TYPE_SERVICE];}
  , STATE_REQUESTED           : 'state_requested'
  , STATE_PROCESSING          : 'state_processing'
  , STATE_REJECTED            : 'state_rejected'
  , STATE_ACCEPTED            : 'state_accepted'
  , STATE_ERROR               : 'state_error'
  , STATE_CONCLUDED           : 'state_concluded'
  , STATE_CANCELED            : 'state_canceled'
  , stateToText : (request_state) => {
      const states = {
        [api.STATE_REQUESTED]    : 'requested', 
        [api.STATE_PROCESSING]   : 'processing', 
        
        [api.STATE_ACCEPTED]     : 'accepted', 
        [api.STATE_CONCLUDED]    : 'concluded',
        

        [api.STATE_REJECTED]     : 'rejected', 
        [api.STATE_ERROR]        : 'error', 
        [api.STATE_CANCELED]    : 'canceled',
      } 
      return states[request_state];
    }
  , stateToColor : (request_state) => {
      const states = {
        [api.STATE_REQUESTED]    : 'gold', 
        [api.STATE_PROCESSING]   : 'green', 
        [api.STATE_ACCEPTED]     : 'green', 
        [api.STATE_CONCLUDED]    : '#87d068',
        

        [api.STATE_REJECTED]     : 'red', 
        [api.STATE_ERROR]        : 'red', 
        [api.STATE_CANCELED]     : 'red',
      } 
      return states[request_state];
    }
  , getStates           : () => { return [api.STATE_REQUESTED, api.STATE_PROCESSING, api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_ERROR, api.STATE_CONCLUDED, api.STATE_CANCELED];}
  , isOnBlockchain      : (request) => {
      return api.getTXId(request);
    }
  , getTXId      : (request) => {
      return request.tx_id || request.transaction_id;
    }
  , isFinished         : (request) => {
      return [api.STATE_REJECTED, api.STATE_CONCLUDED, api.STATE_ERROR].indexOf(request.state)>=0;
    }
  , canCancel          : (request) => {
      console.log(' ## CAN-CANCEL >> ', request.state)
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
  , canAddComprobante  : (request) => {
      return [api.STATE_ACCEPTED, api.STATE_CONCLUDED].indexOf(request.state)>=0;
    }
  , isProcessPending   : (request) => {
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
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
  account_url               : 'https://jungle.bloks.io/account/'
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
  generateSeed : (seed) => {
    // We should derivate several times for security reasons.
    return eos.security_prefix + seed;
  }
}

console.log(' *** EOS.ENDPOINT', eos.endpoint)
console.log(' *** API.ENDPOINT', api.endpoint)
export { language, api, currency, dfuse, bank, eos };
