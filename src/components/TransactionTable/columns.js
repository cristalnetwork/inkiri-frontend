import React from 'react'
import { Button, Tag } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as request_helper from '@app/components/TransactionCard/helper';

import * as utils from '@app/utils/utils';
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

export const columnsForPDA           = (callback) => getColumns(callback);
export const columnsForExternal      = (callback) => getColumns(callback);
export const getColumns              = (callback) => {
    // return columns(this.props.actualRoleId, this.onProcessRequestClick)
    return [
      {
        title: 'Description',
        dataIndex: 'sub_header',
        key: 'sub_header',
        render: (value, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getTypeIcon(record)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_description">{record.sub_header_admin}</span> 
                 <br/>{request_helper.getStateLabel(record, true)} 
              </div>   
            </span>)
        }
      },
      {
        title: 'Tags',
        key: 'tx_type',
        dataIndex: 'tx_type',
        render: (tx_type, record) => {
          
          return (
            <span key={'tags'+record.id}>
               
               {request_helper.getExternalRequestDesc(record)}
               Op.&nbsp;#<Tag key={'request_id_'+record.id}>
                  { request_helper.getRequestId(record)}
               </Tag>
               {request_helper.getGoogleDocLinkOrNothing(record.attach_nota_fiscal_id, true, 'Nota fiscal')}
               {request_helper.getGoogleDocLinkOrNothing(record.attach_boleto_pagamento_id, true, 'Boleto Pagamento')}
               {request_helper.getGoogleDocLinkOrNothing(record.attach_comprobante_id, true, 'Comprobante Bancario')}
            </span>
            )}
      },
      //
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (text, record) => {
          return request_helper.getProcessButton(record, callback);
        }
      },

      {
        title: 'Amount and date',
        
        dataIndex: 'block_time',
        key: 'block_time',
        sortDirections: ['descend'],
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.block_time_number - b.block_time_number,
        align: 'right',
        render: (block_time, record) => (
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin">
            {request_helper.getStyledAmount(record, false, false)}
            {request_helper.getStyledDate(record)}
          </div>
          )
      }
    ];
}

//

export const getColumnsForPersonalExtrato = (callback, account_type) => {
  return [
  {
    title: '#',
    dataIndex: 'sub_header',
    key: 'sub_header',
    render: (value, record) => {
      return(
        <span className="name_value_row">
          <div className="row_name centered" >
            {request_helper.getTypeIcon(record.request)} 
          </div>
          <div className="row_value wider">
            <span className="row_tx_description">{record.sub_header}</span> 
             <div className="" style={{maxWidth:400, overflowWrap:'normal'}}>
               <ul>
                 <li className="hidden">{utils.objectToString(record.data)}</li>
                 <li className="hidden">{utils.objectToString(record.request)}</li>
                 <li><Tag color="volcano" key={'warning_'+Math.random()}>Open to view details</Tag></li>
               </ul>
             </div>
          </div>   
        </span>)
    }
  },
  //
  // {
  //   title: 'Tags',
  //   key: 'tx_type',
  //   dataIndex: 'tx_type',
  //   render: (tx_type, record) => {
  //     let extras = null;
  //     if(globalCfg.api.isDeposit(record.request))
  //     {
  //       const envelope_id = api.bank.envelopeIdFromRequest(record);
  //       extras = (< ><br/><span key={'envelope_'+record.id}>ENVELOPE ID: <b>{envelope_id}</b></span></>);
  //     }
  //     //
  //     return (
  //         <span key={'tags'+record.id}>
  //          {extras}
  //         </span>
  //         )}
  // },
  //
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => {
      const process     = request_helper.getProcessButton(record, callback, 'Details');
      const blockchain  = request_helper.getBlockchainLink(record.transaction_id, true);
      return (<>{process}{blockchain}</>)
    },
  },
  //
  {
    title: 'Amount and date',
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
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin">
            {request_helper.getStyledAmount(record, false, negative)}
            {request_helper.getStyledDate(record)}
          </div>
          )
      }
  }
]};

//

export const getDefaultColumns = (account_type, callback) => {

  return [
    // {
    //   title: 'Date',
    //   dataIndex: 'block_time',
    //   key: 'block_time',
    //   sortDirections: ['descend'],
    //   defaultSortOrder: 'descend',
    //   sorter: (a, b) => a.block_time_number - b.block_time_number,
    // },
    {
      title: 'Description',
      dataIndex: 'sub_header',
      key: 'sub_header',
      render: (value, record) => {
        const text = (globalCfg.bank.isAdminAccount(account_type))?record.sub_header_admin:record.sub_header;
        return(
          <span className="name_value_row">
            <div className="row_name centered" >
              {request_helper.getTypeIcon(record)} 
            </div>
            <div className="row_value wider">
              <span className="row_tx_description">{text}</span> 
               <br/>{request_helper.getStateLabel(record, true)} 
            </div>   
          </span>)
      }
    },

    {
      title: 'Tags',
      key: 'tx_type',
      dataIndex: 'tx_type',
      render: (tx_type, record) => {
        let extras = null;
        if(globalCfg.api.isDeposit(record))
        {
          const envelope_id = api.bank.envelopeIdFromRequest(record);
          extras = (< ><br/><span key={'envelope_'+record.id}>ENVELOPE ID: <b>{envelope_id}</b></span></>);
        }
        //
        return(
          <span key={'tags'+record.id}>
            {extras}
          </span>
        );

        // return (
        //     <span key={'tags'+record.id}>
        //      <Tag color={'geekblue'} key={'type_'+record.id}>
        //             {tx_type.toUpperCase()}
        //      </Tag><br/>
        //      <Tag color={'geekblue'} key={'state_'+record.id}>
        //             {(record.state||'COMPLETED').toUpperCase()}
        //      </Tag>
        //      {extras}
        //     </span>
        //     )
      }
    },
    //
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return request_helper.getProcessButton(record, callback);
      },
    },
    {
    title: 'Amount and date',
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
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin">
            {request_helper.getStyledAmount(record, false, negative)}
            {request_helper.getStyledDate(record)}
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
        title: 'Account',
        dataIndex: 'key',
        key: 'account_name',
        render: (value, record) => {
          return(
            <span className="name_value_row">
              <div className="row_name centered" >
                {request_helper.getAccountTypeIcon(record.account_type)} 
              </div>
              <div className="row_value wider">
                <span className="row_tx_description">{record.key}</span> 
                 {request_helper.getAccountStateTag(record, true)} 
              </div>   
            </span>)
        }
      },
      {
        title: 'Fee & overdraft',
        key: 'fee',
        dataIndex: 'fee',
        render: (fee, record) => {
          
          return (
            <span>
              <Tag color={'geekblue'} key={record.key+fee}>
                    FEE: {globalCfg.currency.toCurrencyString(fee)}
              </Tag>
              <Tag color={'geekblue'} key={record.key+record.overdraft}>
                    OVERDRAFT: {globalCfg.currency.toCurrencyString(record.overdraft)}
              </Tag>
            </span> 
          )}
      },
      //
      {
        title: 'Action',
        key: 'action',        
        render: (text, record) => {
          // return (<Button key={'details_'+request.id} size="small" onClick={()=>{ buttonClick(callback, request) }}>{title}</Button>);
          return <Button key={'details_'+record.key} onClick={()=>{ callback(record) }} icon="profile" size="small">Details</Button>
        }
      },

      {
        title: 'Balance',
        
        dataIndex: 'balance',
        key: 'balance',
        align: 'right',
        render: (balance, record) => (
          <div className="c-activity-row__extra-action c-activity-row__extra-action--margin">
            {request_helper.getStyledBalance(record)}
          </div>
          )
      }
    ];
}