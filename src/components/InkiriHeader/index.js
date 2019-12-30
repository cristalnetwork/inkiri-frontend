import React, {Component} from 'react'
import { Layout, Icon, Button, Tag, Modal } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import UserBalance from './userBalance';

import * as apiRedux from '@app/redux/models/api';
import * as menuRedux from '@app/redux/models/menu'
import * as loginRedux from '@app/redux/models/login'

// import './index.less';
import './right_content.less';

import ReferrerWidget  from '@app/components/InkiriHeader/referrer_widget';
import * as components_helper from '@app/components/helper';

import * as globalCfg from '@app/configs/global';

const { Header } = Layout;

class InkiriHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile:       props.isMobile,
      referrer:       props.referrer 
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    let new_state = {};

    if(this.props.isMobile!=prevProps.isMobile)
      new_state = {...new_state, isMobile:this.props.isMobile}

    if(this.props.referrer!=prevProps.referrer)
      new_state = {...new_state, referrer:this.props.referrer}

    if(this.props.menuIsCollapsed!=prevProps.menuIsCollapsed)
      new_state = {...new_state, menuIsCollapsed:this.props.menuIsCollapsed}
  

    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }

    if(prevProps.getErrors!=this.props.getErrors){
      const ex = this.props.getLastError;
      new_state = {...new_state, 
          getErrors:     this.props.getErrors, 
          result:        ex?'error':undefined, 
          error:         ex?JSON.stringify(ex):null}
      if(ex)
        components_helper.notif.exceptionNotification("An error occurred!", ex, this.props.clearAll)
    }

    if(prevProps.getResults!=this.props.getResults){
      const lastResult = this.props.getLastResult;
      new_state = {...new_state, 
        getResults:      this.props.getResults, 
        result:          lastResult?'ok':undefined, 
        result_object:   lastResult};
      if(lastResult)
      {
        components_helper.notif.successNotification('Operation completed successfully', undefined, this.props.clearAll)
      }
    }


    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
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

  handleLogout() {
    const that = this;
    Modal.confirm({
      title: 'Logout confirmation',
      content: 'Please confirm logout action',
      onOk() {

        that.props.logout();
      },
      onCancel() {
        
      },
    });
    
  }

  render(){
    let header_content ;
    const {referrer, isMobile, menuIsCollapsed} = this.state;
    const logo_class = menuIsCollapsed? 'ant-pro-global-header-logo':'hidden';
    
    if(isMobile)
    {
      header_content = (
        <>
          <a className={logo_class} key="logo" href="/">
            <img src="/favicons/favicon-32x32.png" alt="logo"/>
          </a>
          <div className="right">
            <Button icon={'logout'} shape="circle" onClick={this.props.logout} style={{marginLeft: '8px'}}></Button>
          </div>
        </>
        );
    }
    else{
      //
      header_content=(
        <div className="right">
          <div className="header_element_container">
           <ReferrerWidget />
           <Button style={{marginLeft: '10px', marginRight: '10px'}}  icon={'logout'} onClick={this.handleLogout} size="small">Logout</Button>
          </div>
        </div>
      );
    }
    //
    return (
       <Header style={{ background: '#fff', padding: 0 }}>
          <div className="ant-pro-global-header">  
            {header_content}
          </div>
        </Header>
    )
  }

}
//
//
export default connect(
    (state)=> ({
      actualAccountName : loginRedux.actualAccountName(state),
      menuIsCollapsed :   menuRedux.isCollapsed(state),
      isMobile :          menuRedux.isMobile(state),
      
      isFetching:         apiRedux.isFetching(state),
      getErrors:          apiRedux.getErrors(state),
      getLastError:       apiRedux.getLastError(state),
      getResults:         apiRedux.getResults(state),
      getLastResult:      apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
      callAPI:            bindActionCreators(apiRedux.callAPI, dispatch),
      callAPIEx:          bindActionCreators(apiRedux.callAPIEx, dispatch),
      clearAll:           bindActionCreators(apiRedux.clearAll, dispatch),

      tryLogin:           bindActionCreators(loginRedux.tryLogin, dispatch),
      trySwitchAccount:   bindActionCreators(loginRedux.trySwitchAccount, dispatch),
      logout:             bindActionCreators(loginRedux.logout, dispatch),
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch),

    })
)(InkiriHeader)