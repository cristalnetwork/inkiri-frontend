import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import * as eosjs_name_helper from './eosjs-name';

import * as globalCfg from '@app/configs/global';
// const globalCfg = {
//   eos: {
//       endpoint:                  'http://localhost:8888' 
//   }, 

//   bank :{
//       issuer:                    'cristaltoken'
//       , table_customers:         'customer'
//       , table_customers_action:  'upsertcust'
//       , table_paps:              'pap'
//       , table_paps_action:       'upsertpap'
//   }
// };



export const INDEX_POSITION_CUSTOMER_BY_NAME                  = 1;
export const INDEX_POSITION_PAP_BY_PROVIDER_SERVICE_CUSTOMER  = 2;
export const INDEX_POSITION_PAP_BY_PROVIDER_SERVICE           = 3;
export const INDEX_POSITION_PAP_BY_PROVIDER_CUSTOMER          = 4;
export const INDEX_POSITION_PAP_BY_CUSTOMER_SERVICE           = 5;



const jsonRpc   = new JsonRpc(globalCfg.eos.endpoint_scope)

export const fetchResult = async (options, limit) => {
  const mergedOptions = {
    json: true,
    limit: limit||9999,
    encode_type: "hex",
    ...options,
  };

  const result = await jsonRpc.get_table_rows(mergedOptions);

  return result;

}

export const fetchRows = async (options, limit) => {
  
  const result = await fetchResult(options, limit);

  return result.rows;

}

export const customerByUInt64 = async(name, idx_index) => {

  const boundsHex = eosjs_name_helper.getTableBoundsForName2(name, false);
  const bounds = {
      lower_bound: `${boundsHex.lower_bound}`,
      upper_bound: `${boundsHex.lower_bound}`,
  }

  // console.log('bounds:', bounds)

  const rows = await fetchRows({
    code:     globalCfg.bank.issuer,
    table:    globalCfg.bank.table_customers,
    scope:    globalCfg.bank.issuer,
    key_type: `i64`,
    index_position: idx_index||1,
    ...bounds,
  });

  return rows;
}

export const listPapByProvider = async (provider_account_name, upper, cursor) => {
  const my_upper           = upper || 99999999; 
  
  // const providerHexLE      = eosjs_name_helper.getTableBoundsForName2(provider_account_name, true).lower_bound;
  const firstHexLE = eosjs_name_helper.getTableBoundsForName2(provider_account_name, true).lower_bound;
  const serviceBounds      = {
    lower_bound: eosjs_name_helper.leadingZeros('', 16),
    upper_bound: 'ffffffffffffffff'
  }

  const bounds ={
    lower_bound: `0x${firstHexLE}${serviceBounds.lower_bound}`,
    upper_bound: `0x${firstHexLE}${serviceBounds.upper_bound}`,
   }
  
  console.log('bounds:', bounds)

  const result = await fetchResult({
    code:             globalCfg.bank.issuer,
    table:            globalCfg.bank.table_paps,
    scope:            globalCfg.bank.issuer,
    key_type:         `i128`,
    index_position:   INDEX_POSITION_PAP_BY_PROVIDER_SERVICE,
    next_key:         cursor||null,
    ...bounds,

  });

  return result;

}

export const listPapByCustomer = async (customer_account_name, upper) => {
  const my_upper           = upper || 99999999; 
  
  // const providerHexLE      = eosjs_name_helper.getTableBoundsForName2(provider_account_name, true).lower_bound;
  const firstHexLE = eosjs_name_helper.getTableBoundsForName2(customer_account_name, true).lower_bound;
  const serviceBounds      = {
    lower_bound: eosjs_name_helper.leadingZeros('', 16),
    upper_bound: 'ffffffffffffffff'
  }

  const bounds ={
    lower_bound: `0x${firstHexLE}${serviceBounds.lower_bound}`,
    upper_bound: `0x${firstHexLE}${serviceBounds.upper_bound}`,
   }
  
  console.log('bounds:', bounds)

  const result = await fetchResult({
    code:             globalCfg.bank.issuer,
    table:            globalCfg.bank.table_paps,
    scope:            globalCfg.bank.issuer,
    key_type:         `i128`,
    index_position:   INDEX_POSITION_PAP_BY_CUSTOMER_SERVICE,
    ...bounds,
  });

  return result;

}

// export const listPapByProvider_by256 = async (provider_account_name, upper) => {
//   const my_upper           = upper || 99999999; 
//   const accountHexLE       = eosjs_name_helper.leadingZeros('', 16);
//   const providerHexLE      = eosjs_name_helper.getTableBoundsForName2(provider_account_name, true).lower_bound;  
//   // const serviceBounds      = eosjs_name_helper.getTableBoundsForName2('zzzzzzzzzzzy', true, my_upper);
//   const serviceBounds      = {
//     lower_bound: eosjs_name_helper.leadingZeros('', 16),
//     upper_bound: 'ffffffffffffffff'
//   }
//   const bounds = {
//     lower_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${serviceBounds.lower_bound}`,
//     upper_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${serviceBounds.upper_bound}`,
//   };
//   console.log(bounds);
//   console.log(serviceBounds);
//   const rows = await fetchRows({
//     code:           globalCfg.bank.issuer,
//     table:          globalCfg.bank.table_paps,
//     scope:          globalCfg.bank.issuer,
//     key_type:       'sha256',
//     index_position: INDEX_POSITION_PAP_BY_PROVIDER_SERVICE_CUSTOMER,
//     ...bounds,
//   });
//   return rows;
// }

export const papByCustomerService  = (customer_account_name, service_id_num, step)        => papByUInt128(customer_account_name, service_id_num, INDEX_POSITION_PAP_BY_CUSTOMER_SERVICE, step);
export const papByProviderService  = (provider_account_name, service_id_num, step)        => papByUInt128(provider_account_name, service_id_num, INDEX_POSITION_PAP_BY_PROVIDER_SERVICE, step);
export const papByProviderCustomer = (provider_account_name, customer_account_name, step) => papByUInt128(provider_account_name, customer_account_name, INDEX_POSITION_PAP_BY_PROVIDER_CUSTOMER, step);

export const papByUInt128 = async (first_param, second_param, idx_index, step) => {
  
  const firstHexLE = eosjs_name_helper.getTableBoundsForName2(first_param, true, step).lower_bound;
  const second_paramBounds = eosjs_name_helper.getTableBoundsForName2(second_param, true, step);
  const bounds ={
      lower_bound: `0x${firstHexLE}${eosjs_name_helper.leadingZeros(second_paramBounds.lower_bound)}`,
      upper_bound: `0x${firstHexLE}${eosjs_name_helper.leadingZeros(second_paramBounds.upper_bound)}`,
     }

  // console.log('bounds:', bounds)
  const options = {
    code:             globalCfg.bank.issuer,
    table:            globalCfg.bank.table_paps,
    scope:            globalCfg.bank.issuer,
    key_type:         `i128`,
    index_position:   idx_index||1,
    ...bounds,
  };
  console.log('scope query:', JSON.stringify(options));

  const result = await fetchResult(options);

  // console.log(bounds)

  return result;
}


export const papByChecksum256 = async  (customer_account_name, provider_account_name, service_id_num, index_position) => {
  /* ************************************* */
  // byall
  // LE(0ULL, account).value, LE(provider.value, (uint64_t)service_id_num)
  const accountHexLE  = eosjs_name_helper.getTableBoundsForName2(customer_account_name, true).lower_bound;
  const providerHexLE = eosjs_name_helper.getTableBoundsForName2(provider_account_name, true).lower_bound;
  const serviceBounds = eosjs_name_helper.getTableBoundsForName2(service_id_num, true);
  const bounds = {
    lower_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${eosjs_name_helper.leadingZeros(serviceBounds.lower_bound, 16)}`,
    upper_bound: `${`0`.repeat(16)}${accountHexLE}${providerHexLE}${eosjs_name_helper.leadingZeros(serviceBounds.upper_bound, 16)}`,
  };

  // 0000000000000000 ceb2e9d2a63c6810 a5d869b91b530d30 00002
  // 0000000000000000 ceb2e9d2a63c6810 a5d869b91b530d30 0000000000000002
     

  console.log(bounds);

  const result = await fetchResult({
    code:           globalCfg.bank.issuer,
    table:          globalCfg.bank.table_paps,
    scope:          globalCfg.bank.issuer,
    key_type:       'sha256',
    index_position: index_position | INDEX_POSITION_PAP_BY_PROVIDER_SERVICE_CUSTOMER,
    ...bounds,
  });

  return result;

}


/*
* HOW TO USE
import * as eos_table_getter from '@app/services/inkiriApi/table_getters';


    const provider_account_name = 'organicvegan';
    const service_id_num        = 2; 
    const customer_account_name = 'tutinopablo1';

    console.log(' --------------------- ')
    console.log('provider:', provider_account_name)
    const provider  = await eos_table_getter.customerByUInt64(provider_account_name);
    console.log(' >> res:', provider)

    console.log(' --------------------- ')
    console.log('customer:', customer_account_name)
    const customer  = await eos_table_getter.customerByUInt64(customer_account_name);
    console.log(' >> res:', customer)

    console.log(' --------------------- ')
    console.log('papByCustomerService:')
    const papByCustomerService = await eos_table_getter.papByUInt128(customer_account_name, service_id_num, eos_table_getter.INDEX_POSITION_PAP_BY_CUSTOMER_SERVICE);
    console.log(' >> res:', papByCustomerService)

    console.log(' --------------------- ')
    console.log('papByProvServSimple:')
    const papByProvServSimple = await eos_table_getter.papByUInt128(provider_account_name, service_id_num, eos_table_getter.INDEX_POSITION_PAP_BY_PROVIDER_SERVICE);
    console.log(' >> res:', papByProvServSimple)

    console.log(' --------------------- ')
    console.log('papByProvAccount:')
    const papByProvAccount = await eos_table_getter.papByUInt128(provider_account_name, customer_account_name, eos_table_getter.INDEX_POSITION_PAP_BY_PROVIDER_CUSTOMER);
    console.log(' >> res:', papByProvAccount)
  
    console.log(' --------------------- ')
    console.log('papByAll:')
    const papByAll = await eos_table_getter.papByChecksum256(customer_account_name, provider_account_name, service_id_num, eos_table_getter.INDEX_POSITION_PAP_BY_PROVIDER_SERVICE_CUSTOMER);
    console.log(' >> res:', papByAll)
    
    console.log(' --------------------- ')
    console.log('listPapByProvider:')
    const listPapByProvider = await eos_table_getter.listPapByProvider(provider_account_name);
    console.log(' >> res:', listPapByProvider)


*/