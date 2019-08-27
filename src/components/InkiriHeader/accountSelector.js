import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import './accountSelector.less';

// const { Option } = Select;

const AccountSelector = ({allAccounts, actualAccount, currentAccount, onChange, loading}) => {
    
    const getDisplayAccountData = (account_item) => {
      if(!account_item)
        return 'NA';
      const account_type       = account_item.permissioner.account_type_description.toUpperCase();
      const account_name       = account_item.permissioner.account_name.toUpperCase();
      const account_permission = account_item.permission.replace('active', 'gestor').toUpperCase(); 
      return `${account_name} - Conta ${account_type} [${account_permission}] `
    }

    const getIconForAccountType = (account_item) => {
      if(!account_item)
        return 'loading';

      let icons = {};
      icons[globalCfg.bank.getAccountType(globalCfg.bank.ACCOUNT_TYPE_PERSONAL)]  = 'user';
      icons[globalCfg.bank.getAccountType(globalCfg.bank.ACCOUNT_TYPE_BUSINESS)]  = 'shop';
      icons[globalCfg.bank.getAccountType(globalCfg.bank.ACCOUNT_TYPE_BANKADMIN)] = 'bank';

      // console.log( ' ACCOUNTSELECTOR >> ', allAccounts, account_item);

      return icons[account_item.permissioner.account_type_description]
    }

    const getOptions = () => {
      // console.log(' ++++++++++++ accountSelector::allAccounts >> ', allAccounts)
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
      console.log('click', e);
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
    
    // return (<Dropdown overlay={getOptions()} trigger={['click']} className="accountSelector" icon={<Icon type={getIconForAccountType(currentAccount)} />}>
    //      <a className="ant-dropdown-link" href="#">
    //       {getDisplayAccountData(currentAccount)} <Icon type={getIconForAccountType(currentAccount)} />
    //     </a>
    //   </Dropdown>)

    return (<Dropdown.Button overlay={getOptions()} trigger={['click']} className="accountSelector" icon={<Icon type={getIconForAccountType(currentAccount)} />}>
        <Icon type={getIconForAccountType(currentAccount)} /> {getDisplayAccountData(currentAccount)}
      </Dropdown.Button>)

    // return (
    //     <Select defaultValue={actualAccount} style={{ width: '100%' }} onChange={sendAccount} loading={loading} placeholder={'Select account'}>
    //         { allAccounts.map(acc => <Option key={acc.permissioner.account_name} value={acc.permissioner.account_name}>{getDisplayAccountData(acc)}</Option> )}
    //     </Select>
    // )
}

export default connect(
    (state)=> ({
        allAccounts:     loginRedux.allAccounts(state),
        actualAccount:   loginRedux.actualAccount(state),
        currentAccount:  loginRedux.currentAccount(state),
        isLoading:       loginRedux.isLoading(state)
    })
)(AccountSelector)