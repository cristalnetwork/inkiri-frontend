import React, { useState, useEffect } from 'react';
import { Empty, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import UserBalance from '@app/components/InkiriHeader/userBalance';

const MenuBalanceView = (props) => {
    
    // return (
    //   <div className="menu_balance_wrapper">
    //     <span className="menu_balance_currency">{globalCfg.currency.symbol}</span>
    //     <div className="menu_balance_container">
    //         <UserBalance userId={props.actualAccountName} />
    //         <span className="small">BALANCE</span> 
    //     </div>
        
    //   </div>
    // );
    return (
  <div className="menu_balance_wrapper">
    <div className="menu_balance_container">
        <UserBalance userId={props.actualAccountName} showCurrency={true} />
        <span className="small">BALANCE</span> 
    </div>
 
  </div>
);
    // `
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        actualAccountName:   loginRedux.actualAccountName(state),
        // actualRole:            loginRedux.actualRole(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(MenuBalanceView)

