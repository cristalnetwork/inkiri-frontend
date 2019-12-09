import React, { useState, useEffect } from 'react';
import { Layout, PageHeader } from 'antd';

import InkiriHeader from '@app/components/InkiriHeader';
import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import useMedia from 'react-media-hook2';

import AccountSelector from '@app/components/InkiriHeader/accountSelector';

const { Header, Content, Footer, Sider } = Layout;

const _DashboardContainer = ({footerText,  TopMenu, Menu, Children, area, fileName, itemPath, menuIsCollapsed, collapseMenu, setIsMobile, trySwitchAccount}) => {
    
    const [__menuIsCollapsed, setMenuIsCollapsed] = useState(menuIsCollapsed);
    // console.log(' >>>>>>  DashboardContainer >> menuIsCollapsed >>' , menuIsCollapsed)
    // const onCollapse = (e) => {
    //   // collapseMenu(!menuIsCollapsed);
    // };

    useEffect(() => {
      if(__menuIsCollapsed!=menuIsCollapsed)
        setMenuIsCollapsed(menuIsCollapsed);
    })
    const isMobile = useMedia({
      id: 'DashboardContainer',
      query: '(max-width: 599px)',
    })[0];
    const logo_mobile = isMobile?' logo_mobile':'';
    if(typeof setIsMobile === 'function' ) {
      setIsMobile(isMobile)
    }
    
    const switchAccount = (account_name) => {
      // console.log(`selected ${account_name}`);
      trySwitchAccount(account_name);
    }

    const onCollapse = collapsed => {
        collapseMenu(collapsed)
      };

      //collapsed={menuIsCollapsed} 
    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={__menuIsCollapsed} 
          onCollapse={onCollapse}
          defaultCollapsed={true} 
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
                  <img src="/favicons/favicon-32x32.png" />
                </div>
                {__menuIsCollapsed?(null):(<span>INKIRI BANK</span>)}
              </a>
              {isMobile?(<AccountSelector onChange={switchAccount} isMobile={isMobile}/>):(null)}
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
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch),
      setIsMobile:        bindActionCreators(menuRedux.setIsMobile, dispatch),
      trySwitchAccount:   bindActionCreators(loginRedux.trySwitchAccount, dispatch),
    })
)(_DashboardContainer)

export default DashboardContainer;