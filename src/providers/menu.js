import React, {useEffect} from 'react'
import { connect } from 'react-redux'
//import { getMenuItems, getMenu,  } from '@app/redux/models/menu'
import * as menuRedux from '@app/redux/models/menu'

import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { getPath } from '@app/configs/routes'

const  { SubMenu } = Menu;

const renderItem = (item) => {
    if(item.items) {
        return (
        <SubMenu title={item.title} key={item.key}>
            { item.items.map(renderItem) }
        </SubMenu>
        );
    } else {
        return  (
        <Menu.Item key={item.key}>
            <Link to={getPath(item.path || item.key)}>
                { item.icon? <Icon type={item.icon} />: false }
                <span>{item.title}</span>
            </Link>
        </Menu.Item>
        );
    }
}

export const MenuByRole = ({items = [], menuIsCollapsed = false, getMenu }) => {
        useEffect(()=>{
            getMenu({userId: "1"})
        })
        console.log( '****** MENU::menuIsCollapsed' , menuIsCollapsed)
        return (
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    theme="light"
                    inlineCollapsed={menuIsCollapsed}
                >
                    { items.map(renderItem) }
                </Menu>
        )
};

export default connect(
    state => ({
        items:             menuRedux.getMenuItems(state),
        menuIsCollapsed :  menuRedux.isCollapsed(state)
    }),
    dispatch => ({
        getMenu: bindActionCreators( menuRedux.getMenu, dispatch)
    })
)(MenuByRole)
