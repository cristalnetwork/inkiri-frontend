import React, { useState, useEffect } from 'react';
import { Layout, BackTop } from 'antd';

import InkiriHeader from '@app/components/InkiriHeader';

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
// Meta HACK!
import * as account_redux from '@app/redux/models/accounts';
import * as api_redux from '@app/redux/models/api';
import * as balance_redux from '@app/redux/models/balance';
import * as core_redux from '@app/redux/models/core';
import * as graphql_redux from '@app/redux/models/graphql';

import * as operations_redux from '@app/redux/models/operations';
import * as page_redux from '@app/redux/models/page';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import useMedia from 'react-media-hook2';

import MenuBalanceView from '@app/components/Views/balance_menu'
import MenuAccountView from '@app/components/Views/account_menu'

import InjectMessage from "@app/components/intl-messages";

const { Header, Content, Footer, Sider } = Layout;

const _DashboardContainer = ({footerText,  TopMenu, Menu, Children, area, fileName, itemPath, menuIsCollapsed, actualAccountName, actualRole, currentAccount
                              , collapseMenu, setIsMobile}) => {
    
    const [menu_is_collapsed, setMenuIsCollapsed] = useState(menuIsCollapsed);
    
    useEffect(() => {
      setMenuIsCollapsed(menuIsCollapsed);
    }, [menuIsCollapsed])

    const isMobile = useMedia({
      id: 'DashboardContainer',
      query: '(max-width: 599px)',
    })[0];

    const logo_mobile = isMobile?' logo_mobile':'';
    if(typeof setIsMobile === 'function' ) {
      setIsMobile(isMobile)
    }
    
    const onCollapse = (collapsed, type )=> {
        console.log('dashboard::onCollpase:', collapsed, type);
        if(type=='clickTrigger')
          collapseMenu(collapsed)
        
      };

    //defaultCollapsed={menu_is_collapsed} 

    console.log('isMobile:',isMobile)
    console.log('menu_is_collapsed:',menu_is_collapsed)

    const hidden_if_collapsed = menu_is_collapsed?' hidden':'';
    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={menu_is_collapsed} 
          onCollapse={(collapsed, type) => {onCollapse(collapsed, type)}}
          defaultCollapsed={isMobile}           
          theme="light"
          breakpoint="sm"
          onBreakpoint={broken => {
            // console.log( ' >>> Sider::broken? >>>' , broken);
          }}
          collapsedWidth={isMobile?0:80}
          >

            <div className={"logo" + logo_mobile}>
              <a href="/">
                <div className="img_container">
                  <img alt="Logo" src="/favicons/favicon-32x32.png" />
                </div>
                {!menu_is_collapsed && (<span className="omnes_isologo"><InjectMessage id="inkiri.bank.title" /></span>)}
              </a>
              
            </div>
            <div className={"logo_extra "+actualRole+hidden_if_collapsed}>
              { !menu_is_collapsed && 
                <MenuBalanceView />
              }
              {
                !menu_is_collapsed &&
                <MenuAccountView account={currentAccount} className="menu_account_item" />
              }
            </div>
            { Menu? <Menu renderAccounts={true} area={area} fileName={fileName} itemPath={itemPath} />: false }
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            { TopMenu? <TopMenu/>: <InkiriHeader/> }
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>

            { Children? <Children/>: false }
            <BackTop />
          </Content>
          <Footer style={{ textAlign: 'center' }}>{ footerText || `INKIRI © ${(new Date()).getFullYear()}`}</Footer>
        </Layout>
      </Layout>
    );
}

const DashboardContainer =
 connect(
    state => ({
      menuIsCollapsed:      menuRedux.isCollapsed(state),
      actualAccountName:    loginRedux.actualAccountName(state),
      actualRole:           loginRedux.actualRole(state),
      currentAccount:       loginRedux.currentAccount(state),
    }),
    dispatch => ({

      collapseMenu:         bindActionCreators(menuRedux.collapseMenu, dispatch),
      setIsMobile:          bindActionCreators(menuRedux.setIsMobile, dispatch),
    })
) (_DashboardContainer)

export default DashboardContainer;