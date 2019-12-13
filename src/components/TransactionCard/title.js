import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as request_helper from '@app/components/TransactionCard/helper';

const TransactionTitle = ({title, button}) => {
    
    return(
      <div className="c-header-detail padding-top-1em">
          <div className="c-header-detail__head u-clearfix">
              <div className="c-header-detail__title">{title}</div>
              <div className="c-header-detail__actions">
                {button}
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
)(TransactionTitle)