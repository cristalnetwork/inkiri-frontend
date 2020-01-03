import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as utils from '@app/utils/utils'; 

import InjectMessage from "@app/components/intl-messages";

const TransactionHeader = ({request, transaction}) => {
    
    const getFormatter = (id, request_id, request_date) => {
      return <InjectMessage 
              id={id}
              values={ {request_id:     request_id
                  , request_date: request_date
                  , bold: (str) => <b>{str}</b>
                }} />
    }
    
    let header = (null);
    let tag    = (null);
    if(request)
    {  
      // header = (<>Op. #<b>{request_helper.getRequestId(request)}</b> • Created on <b>{request_helper.getRequestDate(request)}</b></>)
      header = getFormatter("components.TransactionCard.header.op_date_header", request_helper.getRequestId(request), request_helper.getRequestDate(request));
      //
      tag    = request_helper.getStateTag(request);
    }  
    if(transaction)
    {  
      // header = (<>TX #<b>{utils.trimCenter(transaction.id)}</b> • Created on <b>{request_helper.formatDate(transaction.block_time)}</b></>);
      header = getFormatter("components.TransactionCard.header.tx_date_header", utils.trimCenter(transaction.id), request_helper.formatDate(transaction.block_time));
    }
    //
    return(
      <div className="c-header-detail ">
        <div className="c-header-detail__head u-clearfix">
            <div className="c-header-detail__title">
              {header}
            </div>
            <div className="c-header-detail__actions">
              {tag}
            </div>
        </div>
      </div>)
    
    
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TransactionHeader)