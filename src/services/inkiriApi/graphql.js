import gql from 'graphql-tag';
import * as globalCfg from '@app/configs/global';
// import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'
import { ApolloClient, InMemoryCache } from 'apollo-boost'
// import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import * as jwtHelper from './jwt-helper';

/*
* Apollo configuration
*/
const httpLink = createHttpLink({
  uri:  globalCfg.api.graphql_endpoint
});
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const bearer_token = jwtHelper.getBearerTokenByKey(jwtHelper.BANK_AUTH_TOKEN_KEY);
  console.log(bearer_token);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: bearer_token
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});



const GET_CONFIG = gql`
  {
    configuration{
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
    configurationsTransfersReasons{
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
  query xxx($account_name:String, $page:String, $requested_type:String, $from:String, $to:String, $provider_id:String, $state:String, $id:String, $requestCounterId:String, $tx_id:String, $refund_tx_id:String, $attach_nota_fiscal_id:String, $attach_boleto_pagamento_id:String, $attach_comprobante_id:String, $deposit_currency:String, $date_from:String, $date_to:String){
    requests(account_name:$account_name, page:$page, requested_type:$requested_type, from:$from, to:$to, provider_id:$provider_id, state:$state, id:$id, requestCounterId:$requestCounterId, tx_id:$tx_id, refund_tx_id:$refund_tx_id, attach_nota_fiscal_id:$attach_nota_fiscal_id, attach_boleto_pagamento_id:$attach_boleto_pagamento_id, attach_comprobante_id:$attach_comprobante_id, deposit_currency:$deposit_currency, date_from:$date_from, date_to:$date_to){
      _id
      id                        
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
export const requests = async ({page, requested_type='', account_name='', from='', to='', provider_id='', state='', id='', requestCounterId='', tx_id='', refund_tx_id='', attach_nota_fiscal_id='', attach_boleto_pagamento_id='', attach_comprobante_id='', deposit_currency='', date_from='', date_to=''}={}) =>{
  if(account_name && !to && !from && account_name!=globalCfg.currency.issuer)
  {
    from=to=account_name;
  }
  const a        = {account_name:account_name, page:page.toString(), requested_type:requested_type, from:from, to:to, provider_id:provider_id, state:state, id:id, requestCounterId:requestCounterId, tx_id:tx_id, refund_tx_id:refund_tx_id, attach_nota_fiscal_id:attach_nota_fiscal_id, attach_boleto_pagamento_id:attach_boleto_pagamento_id, attach_comprobante_id:attach_comprobante_id, deposit_currency:deposit_currency, date_from:date_from, date_to:date_to};
  console.log(JSON.stringify(a));
  // console.log(GET_REQUESTS);
  return runQuery(GET_REQUESTS, a, 'requests');
}



export const loadProvider = async (provider_id) => runQuery(GET_PROVIDER_DATA, {id:provider_id}, 'provider');
const GET_PROVIDER_DATA  = gql`
  query getProvider($id: String!) {
    provider(id:$id){
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
        userCounterId
      }
      updated_by{
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
        userCounterId
      }
      state
      bank_accounts{
        _id
        bank_name
        agency
        cc
      }
      providerCounterId
    }
  }
`;

export const providers = async ({page, limit='', id='', name='', cnpj='', email='', category='', products_services='', state='', providerCounterId='', bank_name='', bank_agency='', bank_cc=''}={}) =>{
  const a        = {page:page.toString(), limit:limit, id:id, name:name, cnpj:cnpj, email:email, category:category, products_services:products_services, state:state, providerCounterId:providerCounterId, bank_name:bank_name, bank_agency:bank_agency, bank_cc:bank_cc};
  console.log(JSON.stringify(a));
  return runQuery(GET_PROVIDERS, a, 'providers');
}

const GET_PROVIDERS = gql`
  query getProviders($page:String!, $limit:String!, $id:String, $name:String, $cnpj:String, $email:String, $category:String, $products_services:String, $state:String, $providerCounterId:String, $bank_name:String, $bank_agency:String, $bank_cc:String ) {
    providers(page:$page, limit:$limit, id:$id, name:$name, cnpj:$cnpj, email:$email, category:$category, products_services:$products_services, state:$state, providerCounterId:$providerCounterId, bank_name:$bank_name, bank_agency:$bank_agency, bank_cc:$bank_cc){
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
        userCounterId
      }
      updated_by{
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
        userCounterId
      }
      state
      bank_accounts{
        _id
        bank_name
        agency
        cc
      }
      providerCounterId
    }
  }
`;

const runQuery = async (query, variables, _return_field) => {
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
    // console.log(data);
    if(_return_field)
      return data[_return_field]
    return data;
  }
  catch(e)
  {
    console.log('graphql exception for ', _return_field,  e)
  }
  return null;
}

