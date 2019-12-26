import gql from 'graphql-tag';
import * as globalCfg from '@app/configs/global';
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'
import { ApolloProvider, useQuery } from '@apollo/react-hooks';

/*
* Apollo configuration
* Missing credentials!
*/
const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri:  globalCfg.api.graphql_endpoint,
    // headers: {
    //   authorization: localStorage.getItem('token'),
    //   'client-name': 'Space Explorer [web]',
    //   'client-version': '1.0.0',
    // },
  }),
});

const GET_CONFIG = gql`
  {
  
    configurationsJobPositions{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      amount
      created_at
      updated_at
    }
    configurationsPayVehicles{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      bank_account{
        bank_name
        agency
        cc
      }
      created_at
      updated_at
    }
    configurationsPayCategories{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      created_at
      updated_at
    }
    configurationsPayTypes{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      created_at
      updated_at
    }
    configurationsPayModes{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      created_at
      updated_at
    }
    configurationsExternalTxFees{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      amount
      created_at
      updated_at
    }
    configurationsAccountConfigs{
      _id
      created_by{
        _id
        account_name
      }
      updated_by{
        _id
        account_name
      }
      configurationCounterId
      father
      key
      value
      amount
      bank_account{
        bank_name
        agency
        cc
      }
      account{
        account_type
        fee
        overdraft
      }
      created_at
      updated_at
    }
  }
`;

export const loadConfig = async () => runQuery(GET_CONFIG);


const GET_BUSINESS_DATA  = gql`
  query biz($account_name: String!) {
    team(account_name:$account_name){
      _id
      created_by{
        _id
        account_name
        business_name
      }
      account_name
      teamCounterId
      members{
        _id
        member{
          _id
          account_name
          account_type
          first_name
          last_name
          legal_id
          email
        }
        position
        wage
      }
    }
  }
`;
export const loadBizData = async (account_name) => runQuery(GET_BUSINESS_DATA, {account_name:account_name});

const GET_REQUESTS  = gql`
  query xxx($page:String, $requested_type:String, $from:String, $to:String, $provider_id:String, $state:String, $id:String, $requestCounterId:String, $tx_id:String, $refund_tx_id:String, $attach_nota_fiscal_id:String, $attach_boleto_pagamento_id:String, $attach_comprobante_id:String, $deposit_currency:String){
    requests(page:$page, requested_type:$requested_type, from:$from, to:$to, provider_id:$provider_id, state:$state, id:$id, requestCounterId:$requestCounterId, tx_id:$tx_id, refund_tx_id:$refund_tx_id, attach_nota_fiscal_id:$attach_nota_fiscal_id, attach_boleto_pagamento_id:$attach_boleto_pagamento_id, attach_comprobante_id:$attach_comprobante_id, deposit_currency:$deposit_currency){
      _id                        
      created_by{
        _id
        account_name
        alias
        first_name
        last_name
        email
        legal_id
        birthday
        phone
        bank_accounts{
          _id
          bank_name
          agency
          cc
        }
        account_type
        business_name
        created_at
        userCounterId
      }
      requested_by{
        _id
        account_name
        alias
        first_name
        last_name
        email
        legal_id
        birthday
        phone
        bank_accounts{
          _id
          bank_name
          agency
          cc
        }
        account_type
        business_name
        created_at
        userCounterId
      }
      from
      requested_type
      amount
      requested_to{
        _id
        account_name
        alias
        first_name
        last_name
        email
        legal_id
        birthday
        phone
        bank_accounts{
          _id
          bank_name
          agency
          cc
        }
        account_type
        business_name
        created_at
        userCounterId
      }
      to
      state
      tx_id
      refund_tx_id
      requestCounterId
      description
      attach_nota_fiscal_id
      attach_boleto_pagamento_id
      attach_comprobante_id
      deposit_currency
      bank_account{
        bank_name
        agency
        cc
      }
      provider{
        _id
        name
        cnpj
        email
        phone
        address{
          street
          city
          state
          zip
          country
        }
        category
        products_services
        state
        bank_accounts{
          _id
          bank_name
          agency
          cc
        }
        providerCounterId
      }
      provider_extra{
        payment_vehicle
        payment_category
        payment_type
        payment_mode
      }
      service{
        _id
        created_by{
          _id
          account_name
          alias
          first_name
          last_name
          email
          legal_id
          birthday
          phone
          account_type
          business_name
          created_at
          updated_at
          userCounterId
        }
        account_name
        serviceCounterId
        title
        description
        amount
        state
      }
      service_extra{
        begins_at
        expires_at
      }
      created_at
      updated_at

      header
      sub_header
      sub_header_ex
      sub_header_admin
      key
      block_time
      quantity
      quantity_txt
      tx_type
      i_sent
      flag{
        ok
        message
        tag
      }
    }
  }
`;
// export const requests = async (page, limit, requested_type, account_name) => runQuery(GET_BUSINESS_DATA, {account_name:account_name});
export const requests = async ({page, requested_type='', account_name='', from='', to='', provider_id='', state='', id='', requestCounterId='', tx_id='', refund_tx_id='', attach_nota_fiscal_id='', attach_boleto_pagamento_id='', attach_comprobante_id='', deposit_currency}={}) =>{
  if(account_name && !to && !from)
  {
    from=to=account_name;
  }
  const a        = {page:page.toString(), requested_type:requested_type, from:from, to:to, provider_id:provider_id, state:state, id:id, requestCounterId:requestCounterId, tx_id:tx_id, refund_tx_id:refund_tx_id, attach_nota_fiscal_id:attach_nota_fiscal_id, attach_boleto_pagamento_id:attach_boleto_pagamento_id, attach_comprobante_id:attach_comprobante_id, deposit_currency:deposit_currency};
  // const vars     = a.reduce((prev,act) => { if(act) prev[act] = act; return prev; } , {});
  // const gql_vars = Object.keys(vars).map(key=> `${key}:$${key}`).join(',') 
  console.log(JSON.stringify(a));
  console.log(GET_REQUESTS);
  // console.log(vars);
  return runQuery(GET_REQUESTS, a, 'requests');
}



const runQuery = async (query, variables, _field) => {
  // const client = useApolloClient();

  try{
    // const res = await client.query({query: GET_CONFIG, forceFetch: true})
    const { loading, error, data }  = await client.query({query: query, variables:variables, fetchPolicy:'no-cache'})
    if (loading) 
      return null;
    if (error) 
    {
      console.log(error);  
      return null;
    }
    console.log(data);
    if(_field)
      return data[_field]
    return data;
  }
  catch(e)
  {
    console.log('graphql exception', e)
  }
  return null;
}

