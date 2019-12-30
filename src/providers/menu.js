import React, {useEffect, useState} from 'react'
import { connect } from 'react-redux'

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import MenuAccountView from '@app/components/Views/account_menu'
import * as routes_config from '@app/configs/routes'

import { getRootKeys } from '@app/services/routes'
import IntlMessages from "@app/components/intl-messages";
const  { SubMenu } = Menu;

export const MenuByRole = ({ renderAccounts, area, fileName, itemPath, items = [], allAccounts, getMenu, trySwitchAccount2, actualAccountName, actualRole , actualRoleId,  actualPermission, 
                             lastRootMenu, menuIsCollapsed}) => {
        
        const [myActualAccountName, setActualAccountName]   = useState(null);
        const [myActualrole, setActualRole]                 = useState(null);
        
        useEffect(()=>{
            if(myActualrole!=actualRole && myActualAccountName!=actualAccountName)
            {
              setActualAccountName(actualAccountName);
              setActualRole(actualRole);
              getMenu(actualAccountName, actualRole);
            }
        })


        let selected = routes_config.getItemByAreaNFilename(area, fileName, itemPath)
        
        if(((!selected || selected.father_key==='*') || area==='common') && lastRootMenu)
        {
            const path_parts = lastRootMenu.split('/'); 
            const area = path_parts[1];
            const path = path_parts[2];
            selected = routes_config.getItemByFullpath(area, path, null)
        }
        
        const aa = selected?[selected.key]:['dashboard'];

        const bb = menuIsCollapsed?[]:getRootKeys(actualRole); 

        const renderItem = (item) => {
          if(item.permission && !globalCfg.bank.isValidPermission(actualRoleId, item.permission, actualPermission))
              return (null);

          if(item.items) {
              return (
              <SubMenu title={<span>{ item.icon? <Icon type={item.icon} />: false }<span><IntlMessages id={item.title} defaultMessage={item.title} /></span></span>} key={item.key}>
                  { item.items.map(renderItem) }
              </SubMenu>
              );
          } else {
              return  (
              <Menu.Item key={item.key} disabled={item.path!=item.key} className={ item.icon?'is_root_menu':''}>
                  <Link to={routes_config.getPath(item.path || item.key)}>
                      { item.icon? <Icon type={item.icon} />: false }
                      <span><IntlMessages id={item.title} defaultMessage={item.title} /></span>
                  </Link>
              </Menu.Item>
              );
          }
        }
        //
        
        // trySwitchAccount(account_name)

        const handleSwitch = (account_name, role) => {
          if(account_name==actualAccountName && actualRole==role)
            return;
          console.log(' SWITCH ACCOUNT TO:', account_name, role);
          trySwitchAccount2(account_name);
        }

        const renderAccountsMenu = () => {
          // if(!renderAccounts || !allAccounts || allAccounts.length<2)
          //   return (null);
          
          return(<SubMenu title={<span><Icon type="smile" /><span>Accounts</span></span>} key="accounts_menu_key">
                  {allAccounts.map(acc => 
                    <Menu.Item key={acc.permissioner.account_name} style={{height:'auto', minHeight: '40px'}} onClick={()=>handleSwitch(acc.permissioner.account_name, acc.permission)} >
                      <MenuAccountView account={acc}/>
                    </Menu.Item>
                  )}
                 </SubMenu>);
        }
        // `
        
        return (
                <Menu
                    defaultSelectedKeys={aa}
                    defaultOpenKeys={bb}
                    mode="inline"
                    theme="light"
                >
                    { renderAccountsMenu() }
                    { items.map(renderItem) }
                </Menu>
        )
};

//

export default connect(
    state => ({
        items:                 menuRedux.getMenuItems(state),
        allAccounts:           loginRedux.allAccounts(state),
        actualAccountName:     loginRedux.actualAccountName(state),
        actualRole:            loginRedux.actualRole(state),
        actualRoleId:          loginRedux.actualRoleId(state),
        actualPermission:      loginRedux.actualPermission(state),
        lastRootMenu:          menuRedux.lastRootMenu(state),
        menuIsCollapsed :      menuRedux.isCollapsed(state)
    }),
    dispatch => ({
        getMenu:               bindActionCreators( menuRedux.getMenu, dispatch),
        trySwitchAccount2:     bindActionCreators(loginRedux.trySwitchAccount2, dispatch),
    })
)(MenuByRole)
