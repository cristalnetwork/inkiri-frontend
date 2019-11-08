import React, { useState, useEffect } from 'react';
import { Layout, PageHeader } from 'antd';

import InkiriHeader from '@app/components/InkiriHeader';
import * as menuRedux from '@app/redux/models/menu'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import useMedia from 'react-media-hook2';

const { Header, Content, Footer, Sider } = Layout;

const _DashboardContainer = ({footerText,  TopMenu, Menu, Children, area, fileName, itemPath, menuIsCollapsed, collapseMenu, setIsMobile}) => {
    
    const [collapsed, setCollapse] = useState(0);

    // console.log(' >>>>>>  DashboardContainer >> menuIsCollapsed >>' , menuIsCollapsed)
    // const onCollapse = (e) => {
    //   // collapseMenu(!menuIsCollapsed);
    // };

    const isMobile = useMedia({
      id: 'DashboardContainer',
      query: '(max-width: 599px)',
    })[0];

    if(typeof setIsMobile === 'function' ) {
      // console.log(' setIsMobile SETEADO!!!!!!!!!!', isMobile)
      setIsMobile(isMobile)
    }
    // else{
    //   console.log(' setIsMobile is NOT A FUNCTION')
    //   console.log(' menuIsCollapsed => ', menuIsCollapsed)
    // }
    
    const onCollapse = collapsed => {
        setCollapse(collapsed)
      };

      //collapsed={menuIsCollapsed} 
    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={onCollapse}
          defaultCollapsed={true} 
          theme="light"
          breakpoint="sm"
          onBreakpoint={broken => {
            // console.log( ' >>> Sider::broken? >>>' , broken);
          }}
          collapsedWidth={isMobile?0:80}
          
          >
            <div className="logo">
              <img src="/favicons/favicon-32x32.png" />
            </div>
            { Menu? <Menu area={area} fileName={fileName} itemPath={itemPath} />: false }
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            { TopMenu? <TopMenu/>: <InkiriHeader/> }
          </Header>
          <Content style={{ margin: '24px 16px 0' }}>

            { Children? <Children/>: false }
          </Content>
          <Footer style={{ textAlign: 'center' }}>{ footerText || "INKIRI © 2019"}</Footer>
        </Layout>
      </Layout>
    );
}

const DashboardContainer =
 connect(
    state => ({
      menuIsCollapsed :  menuRedux.isCollapsed(state)
    }),
    dispatch => ({
      collapseMenu:      bindActionCreators(menuRedux.collapseMenu, dispatch),
      setIsMobile:       bindActionCreators(menuRedux.setIsMobile, dispatch),
    })
)(_DashboardContainer)

export default DashboardContainer;