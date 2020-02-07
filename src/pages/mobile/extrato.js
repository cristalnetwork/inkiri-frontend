import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as pageRedux from '@app/redux/models/page'

import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Button} from 'antd';

import { DISPLAY_ALL_TXS, DISPLAY_REQUESTS} from '@app/components/TransactionTable';

import MobileRequestListWidget, {REQUEST_MODE_EXTRATO} from '@app/components/Mobile/request-list-widget';
import MobileBalanceWidget  from '@app/components/Mobile/balance-widget';
import * as utils from '@app/utils/utils';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

class Extrato extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page_key:            props.location.pathname,
      page_key_operations: `${props.location.pathname}_${DISPLAY_ALL_TXS}`,
      page_key_requests:   `${props.location.pathname}_${DISPLAY_REQUESTS}`,
      
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             props.isOperationsLoading,
      
      isMobile:            props.isMobile,

      page_key_values:     props.page_key_values,
      // active_tab:          utils.twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
      active_tab:          utils.twoLevelObjectValueOrDefault(props.page_key_values, props.location.pathname, 'active_tab', DISPLAY_REQUESTS)
    };

    this.onTabChange                = this.onTabChange.bind(this);
    this.onTransactionClick         = this.onTransactionClick.bind(this);
    this.onRequestClick             = this.onRequestClick.bind(this);
  }
  
  onTransactionClick(transaction){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/transaction-details'
      , state: { 
          transaction: transaction
          , referrer: this.props.location.pathname
        }
    })
  }

  gotoSend =() => {
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/send'
    }) 
  }

  onRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })
  }

  componentDidMount(){
  } 

  componentDidUpdate(prevProps, prevState) 
  {
      let new_state = {};
      if(this.props.isMobile!=prevProps.isMobile)
      {
        new_state = {...new_state, isMobile:this.props.isMobile};
      }

      if(prevProps.filterKeyValues !== this.props.filterKeyValues)
      {
        // new_state = {...new_state, filter: this.props.filterKeyValues};        
      }

      if(prevProps.page_key_values !== this.props.page_key_values )
      {
        const active_tab = utils .twoLevelObjectValueOrDefault(this.props.page_key_values, this.props.location.pathname, 'active_tab', DISPLAY_ALL_TXS)
        new_state = {...new_state
            , page_key_values: this.props.page_key_values
            , active_tab: active_tab};        

      }

      if(Object.keys(new_state).length>0)      
        this.setState(new_state);


  } 

  onTabChange(key) {
    this.setState({active_tab:key});
    this.props.setPageKeyValue(this.props.location.pathname, {active_tab:key})
  }
  
  //

  render() {

    const {routes, active_tab, isMobile, page_key_operations, page_key_requests} = this.state;
    const wage_filter = this.props.isPersonal
      ?{wage_filter:this.props.actualAccountName}
      :{};
    const collapsedMenuOverlay = (this.props.menuIsCollapsed)
      ?(null)
      :(<div className="overlay"></div>);//
    const collapsedMenu        = (this.props.menuIsCollapsed)
      ?''
      :' menu_shown';
    const action_buttons = this.props.menuIsCollapsed
      ?(<div className="action_buttons">
          <Button key={'pay_button'} size="large" shape="circle" onClick={this.gotoSend} icon="plus"></Button>
        </div>)
      :(null);
    //
    return (
      <>
        <div className={'transaction_list' + collapsedMenu}>
          {collapsedMenuOverlay}
          <MobileBalanceWidget userId={this.props.actualAccountName} />
          <div className="mobile_table_wrapper">
            <MobileRequestListWidget
                filter={wage_filter}
                request_type={DISPLAY_REQUESTS}
                the_key={page_key_requests}
                callback={this.onRequestClick}
                onRef={ref => (this.table_widget = ref)}
                filter_hidden_fields={[]}
                mode={REQUEST_MODE_EXTRATO}
            />
          </div>
          {action_buttons}
        </div>
      </>
    );
  }
}
// `

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        isPersonal:           loginRedux.isPersonal(state),
        isMobile :            menuRedux.isMobile(state),
        menuIsCollapsed:      menuRedux.isCollapsed(state),
        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setPageKeyValue:      bindActionCreators(pageRedux.setPageKeyValue, dispatch),

        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Extrato))));