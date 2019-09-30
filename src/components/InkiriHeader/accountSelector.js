import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import './accountSelector.less';

// const { Option } = Select;

const AccountSelector = ({allAccounts, actualAccount, currentAccount, onChange, loading, isMobile}) => {
    
    const getDisplayAccountData = (account_item) => {
      if(!account_item)
        return 'NA';
      const account_type       = account_item.permissioner.account_type_description.toUpperCase();
      const account_name       = account_item.permissioner.account_name.toUpperCase();
      const account_permission = account_item.permission.replace('active', 'gestor').toUpperCase(); 
      // return `${account_name} - Conta ${account_type} [${account_permission}] `
      // return `${account_name}[${account_type}]${account_permission} `
      return (<><span className="bold">{account_permission}</span><span>@{account_name}</span><span>.{account_type}</span></>)
    }

    const getIconForAccountType = (account_item) => {
      if(!account_item)
        return 'loading';

      return globalCfg.bank.ACCOUNT_ICONS[account_item.permissioner.account_type];
    }

    const getOptions = () => {
      
      // console.log(' ++++++++++++ accountSelector::allAccounts >> ', allAccounts, ' | currentAccount:', currentAccount)
      return (
          <Menu onClick={handleMenuClick}>
            {allAccounts.map(acc => 
              <Menu.Item key={acc.permissioner.account_name}>
                <Icon type={getIconForAccountType(acc)} />
                {getDisplayAccountData(acc)}
              </Menu.Item>
            )}
          </Menu>
        )};

    
    function handleMenuClick(e) {
      // console.log('click', e);
      // const selectedAccount = accounts.find(acc => acc.key === name)
      if(typeof onChange === 'function' && e.key!==actualAccount) {
          onChange(e.key)
      }
    }

    const sendAccount = (name) => {
        const selectedAccount = allAccounts.find(acc => acc.permissioner.account_name === name)
        if(typeof onChange === 'function') {
            onChange(selectedAccount)
        }
    }
    

    // return (<Dropdown.Button overlay={getOptions()} trigger={['click']} className="accountSelector"  placement="bottomRight" icon={<Icon type={getIconForAccountType(currentAccount)} />} >
    //     <Icon type={getIconForAccountType(currentAccount)} /> {getDisplayAccountData(currentAccount)}
    //   </Dropdown.Button>)

    if(!isMobile)
      return (<Dropdown overlay={getOptions()} className="accountSelector"  placement="bottomRight" >
        <Button size="small"><Icon type={getIconForAccountType(currentAccount)} /> {getDisplayAccountData(currentAccount)}</Button>
      </Dropdown>)
    else
      return (<>
        <Dropdown.Button overlay={getOptions()} trigger={['click']} className="accountSelector"  placement="bottomRight" >
          <Icon type={getIconForAccountType(currentAccount)} /> 
        </Dropdown.Button>
        </>)
    

    
}

export default connect(
    (state)=> ({
        allAccounts:     loginRedux.allAccounts(state),
        actualAccount:   loginRedux.actualAccount(state),
        currentAccount:  loginRedux.currentAccount(state),
        isLoading:       loginRedux.isLoading(state)
    })
)(AccountSelector)