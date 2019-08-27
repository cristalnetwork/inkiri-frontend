import React, { useState } from 'react';
import { Layout, PageHeader } from 'antd';

import InkiriHeader from '@app/components/InkiriHeader';
import * as menuRedux from '@app/redux/models/menu'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

const { Header, Content, Footer, Sider } = Layout;

export const DashboardContainer = ({footerText,  TopMenu, Menu, Children, menuIsCollapsed, collapseMenu}) => {
    
    console.log(' DashboardContainer >> menuIsCollapsed:' , menuIsCollapsed)
    const onCollapse = () => {
      // collapseMenu(!menuIsCollapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={menuIsCollapsed} onCollapse={onCollapse} theme="light">
            <div className="logo">
              <img src="/favicons/favicon-32x32.png" />
            </div>
            { Menu? <Menu/>: false }
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            { TopMenu? <TopMenu/>: <InkiriHeader /> }
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>

            { Children? <Children/>: false }
          </Content>
          <Footer style={{ textAlign: 'center' }}>{ footerText || "INKIRI © 2019"}</Footer>
        </Layout>
      </Layout>
    );
}

export default connect(
    state => ({
      menuIsCollapsed :  menuRedux.isCollapsed(state)
    }),
    dispatch => ({
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch)        
    })
)(DashboardContainer)
