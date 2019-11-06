import React, {useEffect} from 'react'
import { connect } from 'react-redux'
//import { getMenuItems, getMenu,  } from '@app/redux/models/menu'
import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'

import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import * as routes_config from '@app/configs/routes'

import { getRootKeys } from '@app/services/routes'

const  { SubMenu } = Menu;

const renderItem = (item) => {
    // console.log(item.key , item.items)
    if(item.items) {
        return (
        <SubMenu title={<span>{ item.icon? <Icon type={item.icon} />: false }<span>{item.title}</span></span>} key={item.key}>
            { item.items.map(renderItem) }
        </SubMenu>
        );
    } else {
        return  (
        <Menu.Item key={item.key} disabled={item.path!=item.key}>
            <Link to={routes_config.getPath(item.path || item.key)}>
                { item.icon? <Icon type={item.icon} />: false }
                <span>{item.title}</span>
            </Link>
        </Menu.Item>
        );
    }
}
//
export const MenuByRole = ({area, fileName, itemPath, items = [], getMenu, actualAccountName, actualRole , lastRootMenu}) => {
        useEffect(()=>{
            getMenu(actualAccountName, actualRole)
        })

        let selected = routes_config.getItemByAreaNFilename(area, fileName, itemPath)
        
        if(area==='common' && lastRootMenu)
        {
            const path_parts = lastRootMenu.split('/'); 
            const area = path_parts[1];
            const path = path_parts[2];
            selected = routes_config.getItemByFullpath(area, path, null)
        }
        
        // console.log(' >> menu >> selected:', JSON.stringify(selected))
        
        const aa = selected?[(selected.father_key?selected.father_key:selected.key)]:['dashboard'];
        
        // const bb = getRootKeys(area);
        const bb = getRootKeys(actualRole); 

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
        lastRootMenu:          menuRedux.lastRootMenu(state)
    }),
    dispatch => ({
        getMenu:               bindActionCreators( menuRedux.getMenu, dispatch)
    })
)(MenuByRole)
