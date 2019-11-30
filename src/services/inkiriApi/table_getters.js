// import * as globalCfg from '@app/configs/global';
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import * as eosjs_name_helper from './eosjs-name';

const globalCfg = {
  eos: {
      endpoint:                  'http://localhost:8888' 
  }, 

  bank :{
      issuer:                    'cristaltoken'
      , table_customers:         'customer'
      , table_customers_action:  'upsertcust'
      , table_paps:              'pap'
      , table_paps_action:       'upsertpap'
  }
};

const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint)

export const fetchRows = async (options, limit) => {
  const mergedOptions = {
    json: true,
    limit: limit||9999,
    ...options,
  };

  const result = await jsonRpc.get_table_rows(mergedOptions);

  return result.rows;
}

export const customerByUInt64 = async(name, idx_index) => {

  const boundsHex = eosjs_name_helper.getTableBoundsForName(name);
  const bounds = {
      lower_bound: `${boundsHex.lower_bound}`,
      upper_bound: `${boundsHex.upper_bound}`,
  }

  console.log('bounds:', bounds)
  
  const rows = await fetchRows({
    code:     globalCfg.bank.issuer,
    table:        globalCfg.bank.table_customers,
    scope:    globalCfg.bank.issuer,
    key_type: `i64`,
    index_position: idx_index||1,
    ...bounds,
  });

  return rows;
}


export const papByUInt128 = async (first_param, second_param, idx_index) => {
  /* ************************************ */
  // byprov 
  // return (uint128_t{provider.value}<<64) | (uint64_t)service_id;
  
  const second_paramHexLE = eosjs_name_helper.getTableBoundsForName(first_param, true).lower_bound;
  const second_paramBounds = eosjs_name_helper.getTableBoundsForName(second_param, true);
  const bounds = {
      lower_bound: `0x${second_paramHexLE}${second_paramBounds.lower_bound}`,
      upper_bound: `0x${second_paramHexLE}${second_paramBounds.upper_bound}`,
  }

  console.log('bounds:', bounds)

  const rows = await fetchRows({
    code:     globalCfg.bank.issuer,
    table:    globalCfg.bank.table_paps,
    scope:    globalCfg.bank.issuer,
    key_type: `i128`,
    index_position: idx_index||1,
    ...bounds,
  });


  return rows;
}

export const papByChecksum256 = async  (customer_account_name, provider_account_name, service_id_num, index_position) => {
  /* ************************************* */
  // byall
  // LE(0ULL, account).value, LE(provider.value, (uint64_t)service_id_num)
  const accountHexLE  = eosjs_name_helper.getTableBoundsForName(customer_account_name, false, true).lower_bound;
  const providerHexLE = eosjs_name_helper.getTableBoundsForName(provider_account_name, false, true).lower_bound;
  const serviceBounds = eosjs_name_helper.getTableBoundsForName(service_id_num, false, true);
  const bounds = {
    lower_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${serviceBounds.lower_bound}`,
    upper_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${serviceBounds.upper_bound}`,
  };

  console.log(bounds);

  const rows = await fetchRows({
    code:           globalCfg.bank.issuer,
    table:          globalCfg.bank.table_paps,
    scope:          globalCfg.bank.issuer,
    key_type:       'sha256',
    index_position: index_position,
    ...bounds,
  });

  return rows;

}