
const language = "english";

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
  asset_precision:  4
};

const bank = {
  contract:               "inkirimaster",
  issuer:                 "inkirimaster",
  ACCOUNT_TYPE_PERSONAL:   1,
  ACCOUNT_TYPE_BUSINESS:   2,
  ACCOUNT_TYPE_FOUNDATION: 3,
  ACCOUNT_TYPE_BANKADMIN:  4,
  ACCOUNT_TYPES:           ['none', 'personal', 'business', 'foundation', 'bankadmin'],
  ACCOUNT_STATE_OK:        1,
  ACCOUNT_STATE_BLOCKED:   2,
  ACCOUNT_STATES:          ['none', 'ok', 'blocked'],
  DEFAULT_FEE :            5,
  DEFAULT_OVERDRAFT :      0,
  
  getAccountType : (account_type) => {
    // console.log(' +-+-+- isPersonalAccount', parseInt(account_type) , '==', bank.ACCOUNT_TYPE_PERSONAL);
    return parseInt(account_type)<bank.ACCOUNT_TYPES.length?bank.ACCOUNT_TYPES[parseInt(account_type)]:undefined;
  },
  isPersonalAccount : (account_type) => {
    // console.log(' +-+-+- isPersonalAccount', parseInt(account_type) , '==', bank.ACCOUNT_TYPE_PERSONAL);
    return parseInt(account_type) == bank.ACCOUNT_TYPE_PERSONAL;
  },
   isBusinessAccount : (account_type) => {
    return parseInt(account_type) == bank.ACCOUNT_TYPE_BUSINESS;
  },
  isAdminAccount : (account_type) => {
    return parseInt(account_type) == bank.ACCOUNT_TYPE_BANKADMIN;
  },
  isEnabledAccount : (account_state) => {
    // console.log(' +-+-+- isEnabledAccount', parseInt(account_state) , '==', bank.ACCOUNT_STATE_OK);
    return parseInt(account_state) == bank.ACCOUNT_STATE_OK;
  }
};


const base_url    = 'http://localhost:3600';
const api_version = '/api/v1';
const api = {
  end_point                   : base_url+ api_version
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
  , isDeposit          : (request) => { return (request.tx_type==api.TYPE_DEPOSIT)}
  , isIKDeposit        : (request) => { return (request.tx_type==api.TYPE_DEPOSIT && request.deposit_currency==api.FIAT_CURR_IK)}
  , isBRLDeposit       : (request) => { return (request.tx_type==api.TYPE_DEPOSIT && request.deposit_currency==api.FIAT_CURR_BRL)}
  , isWithdraw         : (request) => { return (request.tx_type==api.TYPE_WITHDRAW)}
  , getTypes           : () => { return [ api.TYPE_DEPOSIT, api.TYPE_EXCHANGE, api.TYPE_PAYMENT, api.TYPE_PROVIDER, api.TYPE_SEND, api.TYPE_WITHDRAW, api.TYPE_SERVICE];}
  , STATE_REQUESTED           : 'state_requested'
  , STATE_PROCESSING          : 'state_processing'
  , STATE_REJECTED            : 'state_rejected'
  , STATE_ACCEPTED            : 'state_accepted'
  , STATE_ERROR               : 'state_error'
  , STATE_CONCLUDED           : 'state_concluded'
  , getStates           : () => { return [api.STATE_REQUESTED, api.STATE_PROCESSING, api.STATE_REJECTED, api.STATE_ACCEPTED, api.STATE_ERROR, api.STATE_CONCLUDED];}
  , isFinished         : (request) => {
      return [api.STATE_REJECTED, api.STATE_CONCLUDED, api.STATE_ERROR].indexOf(request.state)>=0;
    }
  , canCancel          : (request) => {
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
  , isProcessPending   : (request) => {
      return [api.STATE_REQUESTED].indexOf(request.state)>=0;
    }
};

// ToDo: Traer DFuse config from private server!
const dfuse = {
  api_key                   : 'web_8a50f2bc42c1df1a41830c359ba74240',
  network                   : 'jungle',
  auth_url                  : 'https://auth.dfuse.io/v1/auth/issue',
  base_url                  : 'https://jungle.eos.dfuse.io',
  chain_id                  : 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  websocket_url             : 'wss://jungle.eos.dfuse.io/v1/stream',
  default_page_size         : 25,
  tx_url                    : 'https://jungle.bloks.io/transaction/'
}

export { language, api, currency, dfuse, bank };
