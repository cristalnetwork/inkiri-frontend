import React, { useState, useEffect } from 'react';
import { Empty, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import UserBalance from '@app/components/InkiriHeader/userBalance';
import InjectMessage from "@app/components/intl-messages";

const MenuBalanceView = (props) => {
    return (
      <div className="menu_balance_wrapper">
        <div className="menu_balance_container">
            <UserBalance userId={props.actualAccountName} showCurrency={true} />
            <span className="small uppercase"><InjectMessage id="components.Views.balance_menu.balance" /></span> 
        </div>
     
      </div>
    );
}

export default connect(
    (state)=> ({
        actualAccountName:   loginRedux.actualAccountName(state),
    })
)(MenuBalanceView)

