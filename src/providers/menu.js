import React, {useEffect} from 'react'
import { connect } from 'react-redux'

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import * as routes_config from '@app/configs/routes'

import { getRootKeys } from '@app/services/routes'

const  { SubMenu } = Menu;

export const MenuByRole = ({area, fileName, itemPath, items = [], getMenu, actualAccountName, actualRole , actualRoleId,  actualPermission, lastRootMenu, menuIsCollapsed}) => {
        
        useEffect(()=>{
            getMenu(actualAccountName, actualRole)
        })

        let selected = routes_config.getItemByAreaNFilename(area, fileName, itemPath)
        
        // console.log(' >> PRE >> menu >> selected:', JSON.stringify(selected))

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
              <SubMenu title={<span>{ item.icon? <Icon type={item.icon} />: false }<span>{item.title}</span></span>} key={item.key}>
                  { item.items.map(renderItem) }
              </SubMenu>
              );
          } else {
              return  (
              <Menu.Item key={item.key} disabled={item.path!=item.key} className={ item.icon?'is_root_menu':''}>
                  <Link to={routes_config.getPath(item.path || item.key)}>
                      { item.icon? <Icon type={item.icon} />: false }
                      <span>{item.title}</span>
                  </Link>
              </Menu.Item>
              );
          }
        }
        //
        
        return (
                <Menu
                    defaultSelectedKeys={aa}
                    defaultOpenKeys={bb}
                    mode="inline"
                    theme="light"
                >
                    { items.map(renderItem) }
                </Menu>
        )
};

//

export default connect(
    state => ({
        items:                 menuRedux.getMenuItems(state),
        actualAccountName:     loginRedux.actualAccountName(state),
        actualRole:            loginRedux.actualRole(state),
        actualRoleId:          loginRedux.actualRoleId(state),
        actualPermission:      loginRedux.actualPermission(state),
        lastRootMenu:          menuRedux.lastRootMenu(state),
        menuIsCollapsed :      menuRedux.isCollapsed(state)
    }),
    dispatch => ({
        getMenu:               bindActionCreators( menuRedux.getMenu, dispatch)
    })
)(MenuByRole)
