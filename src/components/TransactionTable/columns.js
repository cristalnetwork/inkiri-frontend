import React from 'react'
import { Popconfirm, Alert, Button, Tag, Icon } from 'antd';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as form_helper from '@app/components/Form/form_helper';
import moment from 'moment';

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import InjectMessage from "@app/components/intl-messages";

export const events = {
    VIEW :        'event_view',
    EDIT :        'event_edit',
    REMOVE :      'event_remove',
    DISABLE :     'event_disable',
    CHILDREN :    'event_children',
    NEW_CHILD :   'event_new_child',
    CHARGE :      'event_charge',
    REQUESTS :    'event_requests',
}

//
export const getColumnsBlockchainTXsForAdmin = (callback) => getColumnsBlockchainTXs(callback, true);

//
export const getColumnsBlockchainTXs = (callback, is_admin) => {
  return [
    {
      title:             <InjectMessage id="components.TransactionTable.columns.date" />,
      dataIndex:         'block_time',
      key:               'block_time',
      sortDirections:    ['descend'],
      defaultSortOrder:  'descend',
      sorter: (a, b) => a.block_time_number - b.block_time_number,
      align:             'left',
      width:             '150px',
      render: (block_time, record) => {
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.formatBlockTime(record)}
            </div>
            )
        }
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.type" />,
      dataIndex: 'tx_type',
      key: 'tx_type',
      width: '400px',
      render: (tx_type, record) => {

        const memo = record.data && record.data.memo && (record.data.memo.split('|').slice(-1)[0]!='undefined') && record.data.memo.split('|').slice(-1)[0] ;
        return (<span className="name_value_row ">
              <div className="row_name centered flex_fixed_width_5em" >
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      {request_helper.getCircledTypeIcon(record.request)} 
                    </div>
                </div>
              </div>
              <div className="row_value wider">
                <div className="ui-info-row__content">
                  <div className="ui-info-row__title">
                    {record.header}
                  </div>
                  <div className="ui-info-row__details">
                      <ul>
                          <li>{is_admin?record.sub_header_admin_ex:record.sub_header}</li>
                      </ul>
                      <ul className={!memo?'hidden':''}>
                          <li><Icon type="message" theme="filled"/> {memo}</li>
                      </ul>
                  </div>
                </div>
              </div>
            </span>)

      }
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.from" />,
      dataIndex: 'data.from',
      key: 'from',
      width: '110px',
    },
    {
      title: 'To',
      dataIndex: 'data.to',
      key: 'to',
      width: '110px',
    },
    {
      title: '#',
      key: 'action',
      width: '80px',
      render: (text, record) => {
        const process     = request_helper.getButtonIcon('', callback, record, <InjectMessage id="components.TransactionTable.columns.details" />)
        const blockchain  = request_helper.getBlockchainLink(record.transaction_id, false, null, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />);
        return (<>{process}&nbsp;{blockchain}</>)
      },
    },
    //
    {
      title:       '$',
      align:       'right',
      dataIndex:   'amount',
      key:         'amount',
      fixed:       'right',
      className:   'amount_col',
      render: (amount, record) => {
        const negative = request_helper.blockchain.isNegativeTransaction(record)
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.getStyledAmount(record, negative)}
            </div>
            )
        }
    }
  ]
};

//
export const expandedRequestRowRender = (record) => {
  
  const flag = record.flag.ok
    ?(null)
    :(<><br/><b>{`${record.flag.tag} - ${record.flag.message}`}</b></>); //`

  // if(!record.flag.ok)
  //   console.log(JSON.stringify(record))
  
  const default_info = (
      <>
         <InjectMessage id="global.operation" />&nbsp;: #<b>{ request_helper.getRequestId(record)}</b>
         {flag}
         {request_helper.getGoogleDocLinkOrNothing(record.attach_nota_fiscal_id, true, 'Nota fiscal')}
         {request_helper.getGoogleDocLinkOrNothing(record.attach_boleto_pagamento_id, true, 'Boleto Pagamento')}
         {request_helper.getGoogleDocLinkOrNothing(record.attach_comprobante_id, true, 'Comprobante Bancario')}
      </>);
 //
  switch (record.requested_type){
    case globalCfg.api.TYPE_PROVIDER:
      const blockchain  = record.tx_id?request_helper.getBlockchainLink(record.tx_id, true, null, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />):(null);
      return (
            <>
              <span key={'tags'+record.id}>&nbsp;<InjectMessage id="global.provider" />:&nbsp;<b>{ request_helper.getRequestProviderDesc(record)}</b></span>
              {Object.keys(record.provider_extra).map(key => 
                 
                  (key!='__typename')
                    ?(<><br/>{key}: <b key={Math.random()}>{record.provider_extra[key]}</b></>)
                    :null
                )}
              <br/> {blockchain}
              <br/>{default_info}
            </>
            );
    //
    case globalCfg.api.TYPE_EXCHANGE:
      const bank_account = record.bank_account || {};
      const blockchain_xch  = record.tx_id?request_helper.getBlockchainLink(record.tx_id, true, null, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />):(null);
      return (
            <><span key={'tags'+record.id}>&nbsp;<InjectMessage id="global.bank_account" />&nbsp;<Icon type="bank" />: <b>{bank_account.bank_name}, {bank_account.agency}, {bank_account.cc}</b></span>
            <br/>{blockchain_xch}
            <br/>{default_info}
            </>
            );
      
    //
    case globalCfg.api.TYPE_WITHDRAW:
      const blockchain_wth  = record.tx_id?request_helper.getBlockchainLink(record.tx_id, true, null, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />):(null);
      return (
            <>{blockchain_wth}
              <br/>{default_info}
            </>
            );
      
    //
    case globalCfg.api.TYPE_DEPOSIT:
      const envelope_id = request_helper.envelopeIdFromRequest(record);
      return <>
          <span key={'envelope_'+record.id}>&nbsp;<InjectMessage id="global.envelope_id" />: <b>{envelope_id}</b></span>
          <br/><span key={'deposit_currency_'+record.id}>&nbsp;<InjectMessage id="global.currency" />: <b>{record.deposit_currency}</b></span>
          <br/>{default_info}
        </>;
    //
    case globalCfg.api.TYPE_SERVICE:
      const service = record.service || {};
      const service_extra  = record.service_extra || {};
      return (
            <><span key={'service_'+record.id}>
                <InjectMessage id="global.service" />:&nbsp;<b>{service.title}, ({service.description})</b>
                <br/>&nbsp;<InjectMessage id="global.price" />:&nbsp;<b>{globalCfg.currency.toCurrencyString(service.amount)}</b>
                <br/><Icon type="calendar" />&nbsp;<InjectMessage id="global.begins_at" />:&nbsp;<strong>{request_helper.formatUnix(service_extra.begins_at)}</strong>
                <br/>&nbsp;<InjectMessage id="global.expires_at" />:&nbsp;<strong>{request_helper.formatUnix(service_extra.expires_at)}</strong>
              </span>
            <br/>{default_info}
            </>
            );
    //
    default:
      return default_info;
    
  } 
  
}
//
export const getColumnsForRequests = (callback, is_admin, process_wages) => {
  return [
    {
      title: <InjectMessage id="components.TransactionTable.columns.date" />,
      dataIndex: 'block_time',
      key: 'block_time',
      sortDirections: ['descend'],
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.block_time_number - b.block_time_number,
      align: 'left',
      width: '150px',
      render: (block_time, record) => {
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.formatBlockTime(record)}
            </div>
            )
        }
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.type" />,
      dataIndex: 'tx_type',
      key: 'tx_type',
      width: '400px',
      render: (tx_type, record) => {
        
        return (<span className="name_value_row ">
              <div className="row_name centered flex_fixed_width_5em" >
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      {request_helper.getCircledTypeIcon(record)} 
                    </div>
                </div>
              </div>
              <div className="row_value wider">
                <div className="ui-info-row__content">
                  <div className="ui-info-row__title">
                    {record.header}
                  </div>
                  <div className="ui-info-row__details">
                      <ul>
                          <li>{is_admin?record.sub_header_admin:record.sub_header_ex}</li>
                          
                      </ul>
                  </div>
                </div>
              </div>
            </span>)

      }
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.status" />,
      dataIndex: 'state',
      key: 'state',
      width: '145px',
      render: (state, record) => request_helper.getStateTag(record)
      // render: (state, record) => {
      //   const required_blockchain_tx = [globalCfg.api.TYPE_PROVIDER, globalCfg.api.TYPE_EXCHANGE, globalCfg.api.TYPE_WITHDRAW];
      //   const invalid = equired_blockchain_tx.includes(record.requested_type) && !record.tx_id;
      //   if(invalid)
      //     return request_helper.getStateTag(ERROR)  
      //   return request_helper.getStateTag(record)
      // }
      
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.from" />,
      dataIndex: 'from',
      key: 'from',
      width: '110px',
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.to" />,
      dataIndex: 'to',
      key: 'to',
      width: '110px',
    },
    {
      title: '#',
      key: 'action',
      width: '80px',
      render: (text, record) => {
        const isFinished = globalCfg.api.isFinished(record);
        const title      = isFinished 
        ? <InjectMessage id="components.TransactionTable.columns.details" /> 
        : <InjectMessage id="components.TransactionTable.columns.process" />;
        return request_helper.getProcessButton(record, callback, title, !isFinished);
      },
    },
    //
    {
      title:       '$',
      align:       'right',
      dataIndex:   'amount',
      key:         'amount',
      // fixed:       'right',
      className:   'amount_col',
      render: (value, record) => {
        const negative = request_helper.blockchain.isNegativeTransaction(record)
        let amount = record.amount;
        if(globalCfg.api.isSalary(record) && process_wages && process_wages.process_wages==true)
          amount = request_helper.computeWageForAccount(record, process_wages.account_name);
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.getStyledAmountEx(amount, negative)}
            </div>
            )
        }
    }
  ]
};

//
export const getColumnsForExternalTransfers = (callback) => {
  return [
    {
      title: <InjectMessage id="components.TransactionTable.columns.date" />,
      dataIndex: 'block_time',
      key: 'block_time',
      sortDirections: ['descend'],
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.block_time_number - b.block_time_number,
      align: 'left',
      width: '150px',
      render: (block_time, record) => {
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.formatBlockTime(record)}
            </div>
            )
        }
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.type" />,
      dataIndex: 'tx_type',
      key: 'tx_type',
      width: '250px',
      render: (tx_type, record) => {
        
        return (<span className="name_value_row ">
              <div className="row_name centered flex_fixed_width_5em" >
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      {request_helper.getCircledTypeIcon(record)} 
                    </div>
                </div>
              </div>
              <div className="row_value wider">
                <div className="ui-info-row__content">
                  <div className="ui-info-row__title">
                    {record.header}
                  </div>
                  <div className="ui-info-row__details">
                      <ul>
                          <li>{record.sub_header_admin}</li>
                          <li>{record.sub_header_ex}</li>
                          
                      </ul>
                  </div>
                </div>
              </div>
            </span>)

      }
    },
    //
    {
      title: <InjectMessage id="global.bank_account" />,
      key: 'bank_account',
      width: '230px',
      render: (text, record) => {
        return request_helper.bankAccountForRequest(record);
      },
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.status" />,
      dataIndex: 'state',
      key: 'state',
      width: '145px',
      render: (state, record) => request_helper.getStateTag(record)
    }
    ,
    {
      title: <InjectMessage id="components.TransactionTable.columns.from" />,
      dataIndex: 'from',
      key: 'from',
      width: '110px',
    },
    {
      title: '#',
      key: 'action',
      width: '80px',
      render: (text, record) => {
        const isFinished = globalCfg.api.isFinished(record);
        const title      = isFinished 
        ? <InjectMessage id="components.TransactionTable.columns.details" /> 
        : <InjectMessage id="components.TransactionTable.columns.process" />;
        return request_helper.getProcessButton(record, callback, title, !isFinished);
      },
    },
    //
    {
      title:       '$',
      align:       'right',
      dataIndex:   'amount',
      key:         'amount',
      // fixed:       'right',
      className:   'amount_col',
      render: (value, record) => {
        let amount = record.amount;
        return (
            <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
              {request_helper.getStyledAmountEx(amount)}
            </div>
            )
        }
    }
  ]
};

//
export const columnsForAccounts = (callback) => {
    
    return [
      {
        title: <InjectMessage id="components.TransactionTable.columns.account" />,
        dataIndex: 'key',
        key: 'account_name',
        render: (value, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getAccountTypeIcon(record.account_type)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">{record.key}</span> 
                 {request_helper.getAccountStateTag(record, true)} 
              </div>   
            </span>);
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.iugu_alias" />,
        key: 'overdraft',
        dataIndex: 'overdraft',
        
        render: (overdraft, record) =>{
          const isBiz = globalCfg.bank.isBusinessAccount(record);
          const _alias = (isBiz&&record.alias)?record.alias:(isBiz?request_helper.errorStateTag('Alias not configured!'):'');
          return (
            <span>
              {_alias}
            </span> 
          )}
      },
      //
      {
        title: <InjectMessage id="components.TransactionTable.columns.fee_overdraft" />,
        key: 'fee',
        dataIndex: 'fee',
        render: (fee, record) => {
          
          return (
            <span>
              <Tag color={'geekblue'} key={Math.random()}>
                <InjectMessage id="components.TransactionTable.columns.fee" />: {globalCfg.currency.toCurrencyString(fee)}
              </Tag>
              <Tag color={'geekblue'} key={Math.random()}>
                <InjectMessage id="components.TransactionTable.columns.overdraft" />: {globalCfg.currency.toCurrencyString(record.overdraft)}
              </Tag>
            </span> 
          )}
      },
      //
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        render: (text, record) => {
          // return (<Button key={'details_'+request.id} size="small" onClick={()=>{ buttonClick(callback, request) }}>{title}</Button>);
          return <Button key={'details_'+record.key} onClick={()=>{ callback(record) }} icon="profile" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.details" /></Button>
        }
      },

      {
        title: <InjectMessage id="components.TransactionTable.columns.balance" />,
        dataIndex: 'balance',
        key: 'balance',
        align: 'right',
        render: (balance, record) => (
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
            {request_helper.getStyledBalance(record)}
          </div>
          )
      }
    ];
}

//
export const columnsForProviders = (callback) => {
  return [
    {
      title: <InjectMessage id="components.TransactionTable.columns.name" />,
      dataIndex: 'name',
      key: 'name',
      sortDirections: ['descend'],
      defaultSortOrder: 'descend',
      // sorter: (a, b) => a.block_time_number - b.block_time_number,
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.cnpj" />,
      dataIndex: 'cnpj',
      key: 'cnpj'
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.contact" />,
      dataIndex: 'email',
      key: 'email',
      render: (email, record) => (
        <>
          <span key={'email_'+record.id}>
           <Icon type="mail" />&nbsp;{email}
          </span><br/>
          <span key={'phone_'+record.id}> 
            <Icon type="phone" />&nbsp;{record.phone}
          </span>
        </>)
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.address" />,
      dataIndex: 'address',
      key: 'address',
      render: (address, record) => (
        <span key={address._id}>
         <Icon type="environment" /> {address.street}, {address.city}, CP {address.zip}, {address.state}, {address.country}
        </span>
        )
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.category" />,
      key: 'category',
      dataIndex: 'category',
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.products_services" />,
      dataIndex: 'products_services',
      key: 'products_services',
      
    },
    {
      title: <InjectMessage id="components.TransactionTable.columns.bank_accounts" />,
      dataIndex: 'bank_accounts',
      key: 'bank_accounts',
      render: (bank_accounts, record) => (
        <span key={'bank_accounts_'+record.id}>
          <Icon type="bank" /> {bank_accounts.map(bank_account => <span key={'bank_accounts'+bank_account._id}>{bank_account.bank_name}, {bank_account.agency}, {bank_account.cc}</span>)} 
        </span>
        )
    },
    //
    {
      title: <InjectMessage id="components.TransactionTable.columns.action" />,
      fixed: 'right',
      width: 100,
      key: 'action',
      render: (record) => 
          (<>
           <Button key={'process_'+record.id} onClick={()=>{ callback(record) }} icon="profile" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.profile" /></Button>
           </>)
        ,
    },
  ];

}

//
export const columnsForProfiles = (callback) => {
    
    return [
      {
        title: <InjectMessage id="components.TransactionTable.columns.name" />,
        dataIndex: 'first_name',
        key: 'first_name',
        render: (first_name, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getAccountTypeIcon(record.account_type)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">{request_helper.getProfileName(record)}</span> 
                <br/>@{record.account_name} 
              </div>   
            </span>)
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.email" />,
        key: 'email',
        dataIndex: 'email',
        render: (email, record) => {
          
          return (
            <span>
              {record.email}
            </span> 
          )}
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.accounts" />,
        dataIndex: 'userCounterId',
        key: 'userCounterId',
        render: (userCounterId, record) => (
          <span>&nbsp;<InjectMessage id="components.TransactionTable.columns.not_available" /></span>
          )
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        align: 'right',
        render: (text, record) => {
          return <Button key={'details_'+record.key} onClick={()=>{ callback(record) }} icon="profile" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.details" /></Button>
        }
      }
    ];
}
//

//
export const columnsForTeams = (callback) => {
    
    return [
      {
        title: <InjectMessage id="global.team" />,
        dataIndex: 'team',
        key: 'team',
        render: (team, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                <Icon type="shop" />
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">{request_helper.getProfileName(record.created_by)}</span> 
                <br/>@{record.account_name} 
              </div>   
            </span>)
        }
      },
      {
        title: <InjectMessage id="global.members" />,
        key: 'members',
        dataIndex: 'members',
        align: 'right',
        render: (members, record) => {
          const members_count = (record.members && Array.isArray(record.members))?record.members.length:0;
          return (<span>{members_count}</span>);
        }
      },
      {
        title: <InjectMessage id="pages.bankadmin.teams.total_wages" />,
        dataIndex: 'teamCounterId',
        key: 'userCounterId',
        align: 'right',
        render: (teamCounterId, record) => {
          const total_wage = (record.members && Array.isArray(record.members))
            ? globalCfg.currency.toCurrencyString( record.members.reduce((acc, member) => acc + Number(member.wage), 0))
            : globalCfg.currency.toCurrencyString(0);
          return (<span>{total_wage}</span>);
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        align: 'right',
        render: (text, record) => {
          return <Button key={'details_'+record.key} onClick={()=>{ callback(record) }} icon="team" size="small">&nbsp;<InjectMessage id="global.members" /></Button>
        }
      }
    ];
}

//

export const columnsForIUGU = (callback) => {
    
    return [
      {
        title: <InjectMessage id="components.TransactionTable.columns.description" />,
        dataIndex: 'sub_header',
        key: 'sub_header',
        render: (value, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.iugu.stateIcon(record)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">
                  {request_helper.iugu.header(record)}
                </span> 
                <br/>{request_helper.iugu.stateLabel(record)}
              </div>   
            </span>)
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.tags" />,
        key: 'tx_type',
        dataIndex: 'tx_type',
        render: (tx_type, record) => {
          const error  = (request_helper.iugu.inError(record))?(<Alert message={record.error} type="error" />):(null);
          const issued = (record.issued_at)?(<p>&nbsp;<InjectMessage id="components.TransactionTable.columns.issued_at" />: {request_helper.iugu.getDate(record.issued_at)} </p>):(null);
          return (
            <span key={'tags'+record.id}>
               {error}
               {issued}
            </span>
            )}
      },
      //
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',
        width: 100,
        render: (text, record) => {
          const iugu        = request_helper.iugu.iuguLink(record);
          const process     = request_helper.getProcessButton(record, callback, <InjectMessage id="components.TransactionTable.columns.details" />);
          const blockchain  = record.issued_tx_id?request_helper.getBlockchainLink(record.issued_tx_id, true, null, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />):(null);
          return (<>{process}&nbsp;{iugu}&nbsp;{blockchain}</>)
        }
      },

      {
        title: <InjectMessage id="components.TransactionTable.columns.amount_and_date" />,
        dataIndex: 'paid_at',
        key: 'paid_at',
        sortDirections: ['descend'],
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.paid_at - b.paid_at,
        align: 'right',
        render: (paid_at, record) => (
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
            {request_helper.iugu.styledAmount(record, (record.error))}
            {request_helper.iugu.styledDate(record, 'Payment date')}
          </div>
          )
      }
    ];
}

//
export const columnsForCrew = (callback, job_positions) => {
      
    return [
      {
        title:     <InjectMessage id="components.TransactionTable.columns.name" />,
        dataIndex: 'member',
        key:       'member',
        render: (member, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getAccountTypeIcon(record.member.account_type)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">{request_helper.getProfileName(record.member)}</span> 
                <br/>@{record.member.account_name} 
              </div>   
            </span>)
        }
      },
      {
        title:     <InjectMessage id="components.TransactionTable.columns.position" />,
        dataIndex: 'position',
        key:       'position',
        render: (position, record) => {
          const _position = job_positions?job_positions.filter(pos=>pos.key==position)[0].title:position;
          return (<span>{_position}</span>);
         }   
      },
      {
        title:     <InjectMessage id="components.TransactionTable.columns.wage" />,
        key:       'wage',
        dataIndex: 'wage',
        render: (wage, record) => {
          
          return (
            <span>
              {globalCfg.currency.toCurrencyString(wage)}
            </span> 
          )}
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        align: 'right',
        render: (text, record) => {                    
          const profile = (<Button key={'profile_'+record.member._id} disabled={true} onClick={()=>{ callback(record, events.VIEW) }} icon="profile" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.profile" /></Button>);
          const edit    = (<Button key={'edit_'+record.member._id}                    onClick={()=>{ callback(record, events.EDIT) }} icon="edit" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.edit" /></Button>);
          const remove  = (<Button key={'details_'+record.member._id} type="link"     onClick={()=>{ callback(record, events.REMOVE) }} icon="delete" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.remove" /></Button>);
          return (<>{profile}&nbsp;{edit}&nbsp;{remove}</>)
        }
      }
    ];
}


//
export const columnsForSalaries = (callback, remove_callback, job_positions) => {
    
    return [
      {
        title:       <InjectMessage id="components.TransactionTable.columns.name" />,
        dataIndex:   'member',
        key:         'member',
        render: (member, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getAccountTypeIcon(record.member.account_type)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_title">{request_helper.getProfileName(record.member)}</span> 
                <br/>@{record.member.account_name} 
              </div>   
            </span>)
        }
      },
      {
        title:       <InjectMessage id="components.TransactionTable.columns.position" />,
        dataIndex:   'position',
        key:         'position',
        render: (position, record) => {
          const _position = job_positions?job_positions.filter(pos=>pos.key==position)[0].title:position;
          return (<span>{_position}</span>);
         }   
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.wage" />,
        key: 'wage',
        dataIndex: 'wage',
        render: (wage, record) => {
          
          return (
            <span>
              {globalCfg.currency.toCurrencyString(wage)}
            </span> 
          )}
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.to_pay" />,
        key: 'current_wage',
        dataIndex: 'current_wage',
        editable: true,
        className:'column_editable'
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.reason" />,
        key: 'current_reason',
        dataIndex: 'current_reason',
        editable: true,
        className:'column_editable'
      }
      ,{
        title: <InjectMessage id="components.TransactionTable.columns.operation" />,
        dataIndex: 'operation',
        align: 'right',
        className:'column_action',
        render: (text, record) =>
          (
            <Popconfirm title="Sure to remove from this month payment list?" onConfirm={() => remove_callback(record)}>
              <a>&nbsp;<InjectMessage id="components.TransactionTable.columns.remove" /></a>
            </Popconfirm>
          )
      },
    ];
}

//

export const columnsForServices = (callback, services_states) => {
    
    const getStateDesc = (state) => {
      if(!services_states)
        return state;
      const the_state = services_states.find(st => st.key==state);
      if(!the_state)
        return state;
      return the_state.title;
    }
    return [
      {
        title: <InjectMessage id="components.TransactionTable.columns.service" />,
        dataIndex: 'title',
        key: 'title',
        width:'40%',
        render: (title, record) => {
          
            return (<span className="name_value_row">
            <div className="row_name centered flex_fixed_width_5em" >
              <div className="ui-row__col ui-row__col--heading">
                  <div className="ui-avatar">
                    {request_helper.getCircledTypeIcon('hack_service')} 
                  </div>
              </div>
            </div>
            <div className="row_value wider">
              <span className="row_tx_title">{record.title}</span> 
               <div className="" style={{maxWidth:400, overflowWrap:'normal'}}>
                 {record.description} 
               </div>
            </div>   
          </span>)
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.status" />,
        dataIndex: 'state',
        key: 'state',
        render: (state, record) => {
          const _state = getStateDesc(state);
          return (<span>
                  {_state}<br/>
                  #{record.serviceCounterId}
                 </span>);
         }   
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.price" />,
        key: 'amount',
        dataIndex: 'amount',
        render: (amount, record) => {
          
          return (
            <span>
              {globalCfg.currency.toCurrencyString(amount)}
            </span> 
          )}
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        align: 'right',
        render: (text, record) => {
          const style     = {marginTop:6};
          const edit      = (<Button key={'edit_'+record._id}        onClick={()=>{ callback(record, events.EDIT) }}      icon="edit" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.edit" /></Button>);
          const children  = (<Button style={style} key={'children_'+record._id}   onClick={()=>{ callback(record, events.CHILDREN) }}  icon="usergroup-delete" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.customers" /></Button>);
          const requests  = (<Button style={style} key={'requests'+record._id}    onClick={()=>{ callback(record, events.REQUESTS) }}  icon="form" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.service_requests" /></Button>);
          const new_child = (<Button style={style} key={'new_child_'+record._id}  onClick={()=>{ callback(record, events.NEW_CHILD) }} icon="user-add" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.new_customer" /></Button>);
          
          return (<>{edit}<br/>{children}<br/>{requests}<br/>{new_child}</>);
          // const _disable = (<Button key={'details_'+record._id} type="link"     onClick={()=>{ callback(record, events.DISABLE) }} icon="pause-circle" size="small">&nbsp;<InjectMessage id="components.TransactionTable.columns.disable" /></Button>);
          // return (<>{edit}&nbsp;{_disable}</>)
        }
      }
    ];
}

//

export const columnsForServiceContract = (callback) => {
    
    return [
      {
        title: <InjectMessage id="components.TransactionTable.columns.customer" />,
        dataIndex: 'account',
        key: 'account',
        width:'40%',
        render: (account, record) => {
          
            return (<span className="name_value_row">
            <div className="row_name centered flex_fixed_width_5em" >
              <div className="ui-row__col ui-row__col--heading">
                  <div className="ui-avatar">
                    {request_helper.getCircledTypeIcon('hack_user')} 
                  </div>
              </div>
            </div>
            <div className="row_value wider">
              <span className="row_tx_title">@{account}</span> 
               
            </div>   
          </span>)
        }
      },
      {
        title: <InjectMessage id="components.TransactionTable.columns.duration" />,
        key: 'begins_at',
        dataIndex: 'begins_at',
        render: (begins_at, record) => {
          
          return (
            <>
              <span>
                <InjectMessage id="components.TransactionTable.columns.begins_at" />: {moment(begins_at).format(form_helper.MONTH_FORMAT_HUMANIZED)}
              </span> 
              <br/><span> 
                <InjectMessage id="components.TransactionTable.columns.expires_at" />: {moment(begins_at).add(record.periods, 'months').format(form_helper.MONTH_FORMAT_HUMANIZED)}
              </span> 
            </> 
          )}
      },
      {
        title:     <InjectMessage id="components.TransactionTable.columns.status" />,
        dataIndex: 'enabled',
        key:       'enabled',
        render: (enabled, record) => {
          const {last_charged, total_charged} = api.pap_helper.getChargeInfo(record);
          const _state                        = (enabled)?<InjectMessage id="components.TransactionTable.columns.active" />:<InjectMessage id="components.TransactionTable.columns.inactive" />;
          return (
            <>
              <span>&nbsp;<InjectMessage id="components.TransactionTable.columns.last_period_charged" />: {last_charged}</span>
              <br/><span>&nbsp;<InjectMessage id="components.TransactionTable.columns.total_periods_charged" />: {total_charged}</span>
              <br/><span>{_state}</span>
            </>);
         }   
      },
      
      {
        title: <InjectMessage id="components.TransactionTable.columns.action" />,
        key: 'action',        
        align: 'right',
        render: (text, record) => {
          const style     = {marginTop:6};
          const charge   = (<Button               key={'charge_'+record.id}   onClick={()=>{ callback(record, events.CHARGE) }}    icon="calendar" size="small" disabled={!record.enabled}>&nbsp;<InjectMessage id="components.TransactionTable.columns.charge" /></Button>);
          const children = (<Button style={style} key={'children_'+record.id} onClick={()=>{ callback(record, events.CHILDREN) }}  icon="download" size="small" >&nbsp;<InjectMessage id="components.TransactionTable.columns.received_payments" /></Button>);
          const _remove  = (<Button style={style} key={'remove_'+record.id}   onClick={()=>{ callback(record, events.REMOVE) }}    icon="delete"   size="small" type="link" disabled>&nbsp;<InjectMessage id="components.TransactionTable.columns.sease_and_remove" /></Button>);
          return (<>{charge}<br/>{children}<br/>{_remove}</>);
        }
      }
    ];
}

//

export const columnsForContractedServices = (callback, services_states) => {
    
    const getStateDesc = (state) => {
      if(!services_states)
        return state;
      const the_state = services_states.find(st => st.key==state);
      if(!the_state)
        return state;
      return the_state.title;
    }
    return [
      {
        title:       <InjectMessage id="components.TransactionTable.columns.service" />,
        dataIndex:   'title',
        key:         'title',
        width:       '350px',
        render: (title, record) => {
            const service  = record.service||{};
            const provider = service.created_by||{};
            const _service_state = getStateDesc(service.state);
            const _service_id    = `#${service.serviceCounterId}`;
            return (<span className="name_value_row">
            <div className="row_name centered flex_fixed_width_5em" >
              <div className="ui-row__col ui-row__col--heading">
                  <div className="ui-avatar">
                    {request_helper.getCircledTypeIcon('hack_service')} 
                  </div>
              </div>
            </div>
            <div className="row_value wider">
              <span className="row_tx_title">{service.title}</span> 
               <div className="" style={{maxWidth:400, overflowWrap:'normal'}}>
                 {service.description}
                 <br/>
                 <br/>&nbsp;<InjectMessage id="components.TransactionTable.columns.provider" />: @{provider.account_name}
                 <br/>&nbsp;<InjectMessage id="components.TransactionTable.columns.status" />: {_service_state}
                 <br/>&nbsp;<InjectMessage id="components.TransactionTable.columns.service_id" />: {_service_id} 
               </div>
            </div>   
          </span>)
        }
      },

      {
        title:      <InjectMessage id="components.TransactionTable.columns.contract" />,
        key:        'begins_at',
        dataIndex:  'begins_at',
        width:      '250px',
        render: (begins_at, record) => {
          
          const {last_charged, total_charged} = api.pap_helper.getChargeInfo(record);
          const _state                        = (record.enabled)?<InjectMessage id="components.TransactionTable.columns.active" />:<InjectMessage id="components.TransactionTable.columns.inactive" />;

          return (
            <>
              <span>
                From: <b>{moment(begins_at).format(form_helper.MONTH_FORMAT_HUMANIZED)}</b>
              </span> 
              <br/><span> 
                To: <b>{moment(begins_at).add(record.periods, 'months').format(form_helper.MONTH_FORMAT_HUMANIZED)}</b>
              </span> 
              <br/><span>&nbsp;<InjectMessage id="components.TransactionTable.columns.last_period_charged" />: <b>{last_charged}</b></span>
              <br/><span>&nbsp;<InjectMessage id="components.TransactionTable.columns.total_periods_charged" />: <b>{total_charged}</b></span>
              <br/><span>&nbsp;<InjectMessage id="components.TransactionTable.columns.status" />: <b>{_state}</b></span>
            </> 
          )}
      },
      {
        title:       <InjectMessage id="components.TransactionTable.columns.price" />,
        key:         'amount',
        dataIndex:   'amount',
        width:       '110px',
        render: (amount, record) => {
          const service = record.service;
          const price = service?(globalCfg.currency.toCurrencyString(service.amount)):<InjectMessage id="components.TransactionTable.columns.not_available" />;
          return (
            <span>
              {price}
            </span> 
          )}
      },
      {
        title:     <InjectMessage id="components.TransactionTable.columns.action" />,
        key:       'action',        
        align:     'right',
        width:     '110px',
        render: (text, record) => {
          const children = (<Button key={'children_'+record.id} onClick={()=>{ callback(record, events.CHILDREN) }}  icon="download" size="small" >&nbsp;<InjectMessage id="components.TransactionTable.columns.payments" /></Button>);
          return (<>{children}</>);
        }
      }
    ];
}

//

export const columnsForServiceContractPayment = (callback) => {
  return [
  {
    title: '#',
    dataIndex: 'sub_header',
    key: 'sub_header',
    width: '60%',
    render: (value, record) => {
      
      return (<span className="name_value_row">
            <div className="row_name centered flex_fixed_width_5em" >
              <div className="ui-row__col ui-row__col--heading">
                  <div className="ui-avatar">
                    {request_helper.getCircledTypeIcon(record.request)} 
                  </div>
              </div>
            </div>
            <div className="row_value wider">
              <span className="row_tx_title">{record.sub_header}</span> 
               <div className="hidden" style={{maxWidth:400, overflowWrap:'normal'}}>
                 <ul>
                   <li><Tag key={'warning_'+Math.random()}>&nbsp;<InjectMessage id="components.TransactionTable.columns.open_details" /></Tag></li>
                 </ul>
               </div>
            </div>   
          </span>)

      
    }
  },
  {
    title: <InjectMessage id="components.TransactionTable.columns.action" />,
    key: 'action',
    render: (text, record) => {
      const process     = request_helper.getProcessButton(record, callback, <InjectMessage id="components.TransactionTable.columns.details" />);
      const blockchain  = request_helper.getBlockchainLink(record.transaction_id, true, <InjectMessage id="components.TransactionTable.columns.blockchain_link_text" />);
      return (<>{process}&nbsp;{blockchain}</>)
    },
  },
  //
  {
    title: <InjectMessage id="components.TransactionTable.columns.amount_and_date" />,
    // fixed: 'right',    
    dataIndex: 'block_time',
    key: 'block_time',
    sortDirections: ['descend'],
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.block_time_number - b.block_time_number,
    align: 'right',
    render: (block_time, record) => {
      const negative = request_helper.blockchain.isNegativeTransaction(record)
      return (
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin_HACK-NO">
            {request_helper.getStyledAmount(record, negative)}
            {request_helper.getStyledDate(record)}
          </div>
          )
      }
  }
]};
