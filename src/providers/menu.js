import React, {useEffect} from 'react'
import { connect } from 'react-redux'
//import { getMenuItems, getMenu,  } from '@app/redux/models/menu'
import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'

import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { getPath, getItemByAreaNFilename } from '@app/configs/routes'
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
            <Link to={getPath(item.path || item.key)}>
                { item.icon? <Icon type={item.icon} />: false }
                <span>{item.title}</span>
            </Link>
        </Menu.Item>
        );
    }
}
//
export const MenuByRole = ({area, fileName, itemPath, items = [], getMenu, actualAccountName, actualRole }) => {
        useEffect(()=>{
            getMenu(actualAccountName, actualRole)
        })

        
        // ToDo: Here goes default selected item menu logic!!!
        // const aa = [(fileName=='dashboard')?fileName:fileName];
        // console.log(' ** MENU - area:', area, ' | fileName:',fileName, ' | itemPath:',itemPath)
        const selected = getItemByAreaNFilename(area, fileName, itemPath)
        const aa = selected?[(selected.father_key?selected.father_key:selected.key)]:['dashboard'];
        const bb = getRootKeys(area);

        // console.log(' *************** ', ' ************ RENDERING MENU area:', area, '|fileName:', fileName);
        // console.log(' ************ RENDERING MENU selected:', JSON.stringify(aa));
        // console.log(' ************ RENDERING MENU open:', JSON.stringify(bb));
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

export default connect(
    state => ({
        items:                 menuRedux.getMenuItems(state),
        actualAccountName:     loginRedux.actualAccountName(state),
        actualRole:            loginRedux.actualRole(state),
    }),
    dispatch => ({
        getMenu:               bindActionCreators( menuRedux.getMenu, dispatch)
    })
)(MenuByRole)
