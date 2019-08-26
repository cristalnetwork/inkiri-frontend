
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
  end_point:               base_url+ api_version
  , default_page_size         : 25
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
