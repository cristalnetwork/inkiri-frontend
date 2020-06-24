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

import { getRootKeys, getRootKeysEx } from '@app/services/routes'
import InjectMessage from "@app/components/intl-messages";
const  { SubMenu } = Menu;

export const MenuByRole = ({ renderAccounts, area, fileName, itemPath, items = [], allAccounts, isMobile, collapseMenu, getMenu, trySwitchAccount2, 
                             actualAccountName, actualRole , actualRoleId,  actualPermission, 
                             lastRootMenu, menuIsCollapsed}) => {
        
        const [myActualAccountName, setActualAccountName]   = useState(null);
        const [myActualrole, setActualRole]                 = useState(actualRole);
        const [mobileMode, setMobileMode]                   = useState(isMobile);
        const [myDeviceRole, setDeviceRole]                 = useState(null);

        useEffect(()=>{
          setMobileMode(isMobile)
        }, [isMobile])

        // useEffect(()=>{
        //   const my_role = isMobile? `mobile_${actualRole}`:actualRole;
        //   setDeviceRole(my_role);
        //   if(actualRole&&my_role)
        //   {
        //     const keys = getRootKeysEx(my_role);
        //     // console.log('=======getRootKeysEx', my_role)
        //     // console.log(keys)
        //     let _selected = routes_config.getItemByAreaNFilename(area, fileName, itemPath);
        //     if(!keys.includes(_selected.key))
        //       setGoBackEnabled(true)
        //     else
        //       setGoBackEnabled(false)
        //   }
        //   else
        //       setGoBackEnabled(false)
        // }, [isMobile, actualRole, area, fileName, itemPath])
        

        useEffect(()=>{
            setActualAccountName(actualAccountName);
            setActualRole(actualRole);
            getMenu(actualAccountName, actualRole);
            
        }, [actualRole, actualAccountName])


        const [selected, setSelected]        = useState(null);
        const [selectedKey, setSelectedKey]  = useState(['dashboard']);
        
        useEffect(()=>{
          let _selected = routes_config.getItemByAreaNFilename(area, fileName, itemPath)
          if(((!_selected || _selected.father_key==='*') || area==='common') && lastRootMenu)
          {
              const path_parts = lastRootMenu.split('/'); 
              const area = path_parts[1];
              const path = path_parts[2];
              _selected = routes_config.getItemByFullpath(area, path, null)
          }
          setSelected(_selected)
          setSelectedKey(_selected?[_selected.key]:['dashboard']);

          console.log('************************** SELECTED MENU ITEM:')
          console.log(_selected)

        }, [area, fileName, itemPath])

        const [rootKeys, setRootKeys]                       = useState([]);
        useEffect(()=>{
          const bb = menuIsCollapsed?[]:getRootKeys(actualRole); 
          setRootKeys(bb)
        }, [actualRole, menuIsCollapsed])

        const onMenuItemClick = ({ item, key, keyPath, domEvent }) =>{
          // console.log(' ======================== onMenuItemClick');
          // console.log('key: ',key)
          // console.log('item: ',item)
          // console.log('isMobile: ', isMobile);
          if(!(item.props.eventKey.startsWith('____') && isMobile))
            return;
          
          // console.log('collapse fired!');
          collapseMenu(true);
        }

        const renderItem = (item) => {
          if(item.permission && !globalCfg.bank.isValidPermission(actualRoleId, item.permission, actualPermission))
              return (null);

          if(item.items) {
            return (
              <SubMenu title={<span>{ item.icon? <Icon type={item.icon} />: false }<span><InjectMessage id={item.title} defaultMessage={item.title} /></span></span>} key={item.key}>
                  { item.items.map(renderItem) }
              </SubMenu>
              );
              //
          } else {
              return  (
              <Menu.Item key={'____'+item.key} disabled={item.path!=item.key} className={ item.icon?'is_root_menu':''}>
                  <Link to={routes_config.getPath(item.path || item.key)}>
                      { item.icon? <Icon type={item.icon} />: false }
                      <span><InjectMessage id={item.title} defaultMessage={item.title} /></span>
                  </Link>
              </Menu.Item>
              );
          }
        }
        //
        
        const handleSwitch = (account_name, role) => {
          if(account_name==actualAccountName && actualRole==role)
            return;
          console.log(' SWITCH ACCOUNT TO:', account_name, role);
          trySwitchAccount2(account_name);
        }

        const renderAccountsMenu = () => {
          // if(!renderAccounts || !allAccounts || allAccounts.length<2)
          //   return (null);
          
          return(<SubMenu title={<span><Icon type="smile" /><span><InjectMessage id="providers.menu.my_accounts" /></span></span>} key="accounts_menu_key">
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
                    onClick={onMenuItemClick}
                    defaultSelectedKeys={selectedKey}
                    defaultOpenKeys={rootKeys}
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
        menuIsCollapsed :      menuRedux.isCollapsed(state),
        isMobile :             menuRedux.isMobile(state),
    }),
    dispatch => ({
        collapseMenu:          bindActionCreators( menuRedux.collapseMenu, dispatch),   
        getMenu:               bindActionCreators( menuRedux.getMenu, dispatch),
        trySwitchAccount2:     bindActionCreators(loginRedux.trySwitchAccount2, dispatch),
    })
)(MenuByRole)
