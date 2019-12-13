import React, { useState, useEffect } from 'react';
import { Layout, PageHeader } from 'antd';

import * as globalCfg from '@app/configs/global';

import InkiriHeader from '@app/components/InkiriHeader';
import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import useMedia from 'react-media-hook2';

import AccountSelector from '@app/components/InkiriHeader/accountSelector';
import UserBalance from '@app/components/InkiriHeader/userBalance';

const { Header, Content, Footer, Sider } = Layout;

const _DashboardContainer = ({footerText,  TopMenu, Menu, Children, area, fileName, itemPath, menuIsCollapsed, actualAccountName, actualRole, collapseMenu, setIsMobile, trySwitchAccount}) => {
    
    const [__menuIsCollapsed, setMenuIsCollapsed] = useState(menuIsCollapsed);
    // console.log(' >>>>>>  DashboardContainer >> menuIsCollapsed >>' , menuIsCollapsed)
    // const onCollapse = (e) => {
    //   // collapseMenu(!menuIsCollapsed);
    // };

    useEffect(() => {
      if(__menuIsCollapsed!=menuIsCollapsed)
        setMenuIsCollapsed(menuIsCollapsed);
      console.log('dashboard::useEffect::menuIsCollapsed', menuIsCollapsed);
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

    const onCollapse = (collapsed, type )=> {
        // console.log('dashboard::onCollpase:', collapsed, type);
        if(type=='clickTrigger')
          collapseMenu(collapsed)
        
      };

    const hidden_if_collapsed = __menuIsCollapsed?' hidden':'';
    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={__menuIsCollapsed} 
          onCollapse={(collapsed, type) => {onCollapse(collapsed, type)}}
          defaultCollapsed={__menuIsCollapsed} 
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
            <div className={"logo_extra "+actualRole+hidden_if_collapsed}>
              {__menuIsCollapsed?(null):<>
                                          <span>{globalCfg.currency.symbol}<UserBalance userId={actualAccountName} /></span>
                                          <br/> <span className="small">BALANCE</span> 
                                        </>}
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
      menuIsCollapsed :     menuRedux.isCollapsed(state),
      actualAccountName :   loginRedux.actualAccountName(state),
      actualRole :          loginRedux.actualRole(state),
      
    }),
    dispatch => ({
      collapseMenu:         bindActionCreators(menuRedux.collapseMenu, dispatch),
      setIsMobile:          bindActionCreators(menuRedux.setIsMobile, dispatch),
      trySwitchAccount:     bindActionCreators(loginRedux.trySwitchAccount, dispatch),
    })
)(_DashboardContainer)

export default DashboardContainer;