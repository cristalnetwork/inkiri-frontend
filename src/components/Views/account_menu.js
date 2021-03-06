import React, { useState, useEffect } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import { injectIntl } from "react-intl";

const MenuAccountView = (props) => {
    
    const [account, setAccount]       = useState(null);
    useEffect(() => {
        setAccount(props.account);
    }, [props.account]);

    const [role_text, setRoleText] = useState('');    
    const [type_text, setTypeText] = useState('');
    
    useEffect(() => {
      setRoleText(props.intl.formatMessage({id:'components.Views.account_menu.role'}));
      setTypeText( props.intl.formatMessage({id:'components.Views.account_menu.type'}) );
    }, []);


    if(!account)
      return (null);
    
    const getDisplayAccountData = (account_item) => {
      if(!account_item)
        return 'NA';
      const account_type       = account_item.permissioner.account_type_description.toUpperCase();
      const account_name       = account_item.permissioner.account_name;
      const account_permission = account_item.permission.toUpperCase(); 
      
      return (<>
                <span className="menu_account_name">{account_name}</span>
                <div className="menu_account_container">
                  <span className="menu_account_permission"><span className="uppercase">{role_text}</span>: <span>{account_permission}</span></span>
                  <span className="menu_account_type"><span className="uppercase">{type_text}</span>: <span>{account_type}</span></span>
                </div>
              </>);
    }
    
    //
    const getIconForAccountType = (account_item) => {
      if(!account_item)
        return 'loading';

      return globalCfg.bank.ACCOUNT_ICONS[account_item.permissioner.account_type];
    }

    return (
      <div className={`${props.className||''}`}>
        <Icon type={getIconForAccountType(account)} className={` ${props.actualRole} ${account.permissioner.account_name==props.actualAccountName?'menu_account_selected':''}`}/>
        &nbsp;{getDisplayAccountData(account)}
      </div>
    );
    // `
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        actualAccountName:   loginRedux.actualAccountName(state),
        actualRole:            loginRedux.actualRole(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(injectIntl(MenuAccountView))

