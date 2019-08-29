import React, {Component} from 'react'
import { Layout, Icon, Button, Tag } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import UserBalance from './userBalance';

import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'
import styles from './index.less';

import UserSelector from './userSelector'

import AccountSelector from '@app/components/InkiriHeader/accountSelector';

const { Header } = Layout;

class InkiriHeader extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }


  toggle = () => {
    this.props.collapseMenu(!this.props.menuIsCollapsed);
    // this.setState({
    //   collapsed: !this.state.collapsed,
    // });
  };

  accountToString(account){
    return JSON.stringify(account);
  }
  

  handleChange(account_name) {
    console.log(`selected ${account_name}`);
    this.props.trySwitchAccount(account_name);
  }

  /*
    * <div className="header_element_container">
    *  <UserSelector onChange={this.handleChange} />
    * </div>
  */
  /*
    * <div className="header_element_container">
    *   <a className="header_element_top_padded header_element_left_padded" target="_blank" href="https://jungle.bloks.io/account/ikadminoooo1">View account on blockexplorer</a>
    * </div>
    * {this.props.actualAccount} 
  */
  render(){
    return (
       <Header style={{ background: '#fff', padding: 0 }}>
          <div className="ant-pro-global-header">  
            <Icon
              className="trigger"
              type={this.props.menuIsCollapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />

            <div className="right">
              <div className="header_element_container">
                <Button icon={'logout'} onClick={this.props.logout}>Logout</Button>
              </div>
              <div className="header_element_container" style={{marginRight: '10px'}}>
                <AccountSelector onChange={this.handleChange} />
                 &nbsp; <Tag> Account Balance (IK$) <UserBalance userId={this.props.actualAccount} /> </Tag>
              </div>
            </div>
          </div>
        </Header>
    )
  }

}
//
export default connect(
    (state)=> ({
      actualAccount :   loginRedux.actualAccount(state),
      menuIsCollapsed : menuRedux.isCollapsed(state)
    }),
    (dispatch)=>({
        // try: bindActionCreators(userRedux.tryUserState , dispatch),
        tryLogin:           bindActionCreators(loginRedux.tryLogin, dispatch),
        trySwitchAccount:   bindActionCreators(loginRedux.trySwitchAccount, dispatch),
        logout:             bindActionCreators(loginRedux.logout, dispatch),
        collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch)
    })
)(InkiriHeader)