import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as utils from '@app/utils/utils'; 

const TransactionHeader = ({request, transaction}) => {
    
    let header = (null);
    let tag    = (null);
    if(request)
    {  
      header = (<>Op. #<b>{request_helper.getRequestId(request)}</b> • Created on <b>{request_helper.getRequestDate(request)}</b></>)
      //
      tag    = request_helper.getStateTag(request);
    }  
    if(transaction)
      header = (<>TX #<b>{utils.trimCenter(transaction.id)}</b> • Created on <b>{request_helper.formatDate(transaction.block_time)}</b></>);
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