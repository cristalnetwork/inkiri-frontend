import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import * as request_helper from '@app/components/TransactionCard/helper';

const TransactionHeader = ({request}) => {
    
    return(
      <div className="c-header-detail ">
        <div className="c-header-detail__head u-clearfix">
            <div className="c-header-detail__title">
              Op. #<b>{request_helper.getRequestId(request)}</b> • Created on <b>{request_helper.getRequestDate(request)}</b>
            </div>
            <div className="c-header-detail__actions">
              {request_helper.getStateTag(request)}
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