
const versionConfig = {
  
  // DEV/PRIVATE TESTNET
  private_url       : "https://5d39fd88fa091c001447075b.mockapi.io/api/v1/",
  assets_url        : "https://cdn/something/",
  public_url        : "??",
  asset_precision   : 2,
  chain_id          : "",
  admin_pub_key     : "",
  language          : "english"
};

const language = versionConfig.language;

const currency = {
  token:            "inkiritoken1",
  name:             "INKIRI",
  symbol:           "IK$",
  eos_symbol:       "INK",
  fiat:             {
                      symbol: "BRL$",
                      plural: "Reais"
                    },
  asset_precision:  versionConfig.asset_precision
};

const bank = {
  contract:               "ikmasterooo1",
  issuer:                 "ikmasterooo1",
  ACCOUNT_TYPE_PERSONAL:   1,
  ACCOUNT_TYPE_BUSINESS:   2,
  ACCOUNT_TYPE_FOUNDATION: 3,
  ACCOUNT_TYPE_BANKADMIN:  4,
  ACCOUNT_STATE_OK:        1,
  ACCOUNT_STATE_BLOCKED:   2,
  DEFAULT_FEE :            5,
  DEFAULT_OVERDRAFT :      0
  
};

const api = {
  base: versionConfig.base_url,
  baseFiles: versionConfig.assets_url + "files/",
  baseImages: versionConfig.assets_url + "static/uploads/",

  interval_update_tx_ms: 30000,
  timeout_force_update_tx_ms: 15000,
  interval_status_check_ms: 60000,
  chain_id: versionConfig.chain_id,
  
  version: "v1",
  urls: [
    { action: "URL/DFUSE_CONFIG", path: "dfuse/" },
    //http://5d39fd88fa091c001447075b.mockapi.io/api/v1/dfuse
  ]
};

// ToDo: Traer DFuse config from private server!
const dfuse = {
  api_key       : 'web_8a50f2bc42c1df1a41830c359ba74240',
  network       : 'jungle',
  auth_url      : 'https://auth.dfuse.io/v1/auth/issue',
  base_url      : 'https://jungle.eos.dfuse.io',
  chain_id      : 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  websocket_url : 'wss://jungle.eos.dfuse.io/v1/stream'
}

export { language, api, currency, dfuse, bank };
