import React, {useEffect, useState, Component} from 'react'
import * as globalCfg from '@app/configs/global';
import { connect } from 'react-redux'
import { withRouter, Link } from "react-router-dom";

import SelectLanguage from '@app/components/Header/SelectLang';
import { Layout, Icon, Menu, Breadcrumb, Spin } from 'antd';
import VersionIndicator from '@app/components/version_indicator';
import UIFooter from '@app/components/footer';
import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

const { Header, Content, Footer } = Layout;

const GuestContainer = (props) => {
  
  const [counter, setCounter]             = useState(null);
  useEffect(() => {
      setCounter(Math.random());
    }, [props.content, props.modal, props.ref_intl, props.breadcrumb]);

  return (
    <Layout style={{ minHeight: '100vh' }} theme="light" className="home">
      <Header>
        <div className="home_logo">
          <a href="/">
            <img src="/favicons/favicon-32x32.png" alt="" />
            &nbsp;<span className="omnes_isologo"><InjectMessage id="app.title" values={{small: (str) => <small key={Math.random()}>{str}</small>}} /></span>
          </a>
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">
            <Link to='/login'>
                <Icon type="login" />
                <span>{props.ref_intl.menu_action_login}</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <SelectLanguage />
          </Menu.Item>
        </Menu>
      </Header>
      <Content>
        {props.breadcrumb}
        <div className="content">
          {props.content}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}><UIFooter /></Footer>
      
      {props.modals}
      
    </Layout>
  );
  
}


export default (withRouter(

((injectIntl(GuestContainer))) 

));