import React, {Component} from 'react'
import { Layout, Button, Modal } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router-dom";

import * as apiRedux from '@app/redux/models/api';
import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login';
import * as messagingRedux from '@app/redux/models/messaging'

import * as utils from '@app/utils/utils';
import './right_content.less';

import SelectLanguage from '@app/components/InkiriHeader/SelectLang';
import ReferrerWidget  from '@app/components/InkiriHeader/referrer_widget';
import NotificationWidget from '@app/components/InkiriHeader/NoticeIconView';
import * as components_helper from '@app/components/helper';

import { injectIntl } from "react-intl";

const { Header } = Layout;

class InkiriHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile:        props.isMobile,
      referrer:        props.referrer,
      canGoBack:       props.canGoBack,
      menuIsCollapsed: props.menuIsCollapsed
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.goBack       = this.goBack.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    let new_state = {};

    if(this.props.canGoBack!=prevProps.canGoBack)
      new_state = {...new_state, canGoBack:this.props.canGoBack}

    if(!utils.objectsEqual(this.state.messages, this.props.messages))
      new_state = {...new_state, messages:this.props.messages}

    if(this.props.isMobile!=prevProps.isMobile)
      new_state = {...new_state, isMobile:this.props.isMobile}

    if(this.props.referrer!=prevProps.referrer)
      new_state = {...new_state, referrer:this.props.referrer}

    if(this.props.menuIsCollapsed!=prevProps.menuIsCollapsed)
      new_state = {...new_state, menuIsCollapsed:this.props.menuIsCollapsed}
  

    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }

    if(!utils.arraysEqual(prevProps.getErrors, this.props.getErrors)){
      const ex = this.props.getLastError;
      new_state = {...new_state, 
          getErrors:     this.props.getErrors, 
          result:        ex?'error':undefined, 
          error:         ex?JSON.stringify(ex):null}
      if(ex)
        components_helper.notif.exceptionNotification( this.props.intl.formatMessage({id:'errors.occurred_title'}), ex, this.props.clearAll, this.props.intl)
    }

    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const lastResult = this.props.getLastResult;
      new_state = {...new_state, 
        getResults:      this.props.getResults, 
        result:          lastResult?'ok':undefined, 
        result_object:   lastResult};
      if(lastResult)
      {
        components_helper.notif.successNotification(this.props.intl.formatMessage({id:'success.oper_completed_succ'}), undefined, this.props.clearAll)
      }
    }

    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  toggle = () => {
    this.props.collapseMenu(!this.props.menuIsCollapsed);
  };

  handleLogout() {
    const that = this;
    const {formatMessage} = this.props.intl;
    Modal.confirm({
      title: formatMessage({id:'components.InkiriHeader.logout_title'}),
      content: formatMessage({id:'components.InkiriHeader.logout_message'}),
      onOk() {
        that.props.logout();
      },
      onCancel() {
        
      },
    });
    
  }

  goBack(){
    this.props.history.goBack();
  }

  /*
    <Button style={{marginLeft: '10px', marginRight: '10px'}}  icon={'logout'} onClick={this.handleLogout} size="small">
     {this.props.intl.formatMessage({id:'global.logout'})}
    </Button>
 */
  render(){
    let header_content ;
    const {referrer, isMobile, menuIsCollapsed, canGoBack} = this.state;
    
    if(isMobile)
    {
      console.log('canGoBack:', canGoBack)
      console.log('menuIsCollapsed:', menuIsCollapsed)
      const logo_class = (menuIsCollapsed&&canGoBack)
        ? 'ant-pro-global-header-logo'
        : 'hidden';
      /*
        <a className={logo_class} key="logo" href="/" style={{paddingLeft:64}}>
          <img src="/favicons/favicon-32x32.png" alt="logo"/>
        </a>
      */
      header_content = (
        <>
          <Button className={'back_button ' + logo_class} icon="left" onClick={this.goBack} ></Button>
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
           <NotificationWidget />
           <ReferrerWidget />
           <SelectLanguage />
           <Button icon={'logout'} type="link" onClick={this.props.logout} style={{marginLeft:8, marginRight: '10px', color:'rgba(0, 0, 0, 0.8)'}} title={this.props.intl.formatMessage({id:'global.logout'})}></Button>
          </div>
        </div>
      );
    }
    // <Header style={{ background: '#fff', padding: 0 }}> </Header>
    return (
          <div className="ant-pro-global-header" >  
            {header_content}
          </div>
    )
  }
  
}
//
//
export default withRouter(connect(
    (state)=> ({
      actualAccountName : loginRedux.actualAccountName(state),
      menuIsCollapsed :   menuRedux.isCollapsed(state),
      isMobile :          menuRedux.isMobile(state),
      canGoBack:          menuRedux.canGoBack(state),
      messages:           messagingRedux.messages(state),
      isFetching:         apiRedux.isFetching(state),
      getErrors:          apiRedux.getErrors(state),
      getLastError:       apiRedux.getLastError(state),
      getResults:         apiRedux.getResults(state),
      getLastResult:      apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
      onShownMessages:    bindActionCreators(messagingRedux.onShownMessages, dispatch),
      callAPI:            bindActionCreators(apiRedux.callAPI, dispatch),
      callAPIEx:          bindActionCreators(apiRedux.callAPIEx, dispatch),
      clearAll:           bindActionCreators(apiRedux.clearAll, dispatch),

      tryLogin:           bindActionCreators(loginRedux.tryLogin, dispatch),
      logout:             bindActionCreators(loginRedux.logout, dispatch),
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch),

    })
)( injectIntl(InkiriHeader)) )