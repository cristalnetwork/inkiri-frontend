import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { withRouter } from "react-router-dom";

import { Card, PageHeader, Button } from 'antd';

import { DISPLAY_PROVIDER} from '@app/components/TransactionTable';
// import TableStats, { buildItemMoneyPending, buildItemUp, buildItemDown, buildItemCompute, buildItemSimple, buildItemMoney, buildItemPending} from '@app/components/TransactionTable/stats';

import RequestListWidget from '@app/components/request-list-widget';

import { injectIntl } from "react-intl";

class ProvidersPayments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      txs:            [],
      
      page:           -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:           {}
    };

    this.onNewRequestClick          = this.onNewRequestClick.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  onProcessRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })

  }

  onNewRequestClick(){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/providers-payments-request`
      , state: { 
          referrer: this.props.location.pathname
        }
    })
  }
  
  //
  render() {
    //
    const content               = this.renderContent();
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.business.providers-payments.title'})}
          extra={[
              <Button key="_new_request" size="small" type="primary" icon="plus" onClick={()=>this.onNewRequestClick()}>&nbsp; 
                {this.props.intl.formatMessage({id:'pages.business.providers-payments-request.request_payment'})}
              </Button>
            ]}
        />
          
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {content}
        </Card>
        

      </>
    );
  }
  
  renderContent(){
    const request_filter = {account_name:this.props.actualAccountName
      , from:this.props.actualAccountName
      }

    return (<RequestListWidget 
        the_key={'external_transfert_widget_key'} 
        callback={this.onProcessRequestClick} 
        onRef={ref => (this.table_widget = ref)}
        filter_hidden_fields={['from', 'to', 'requested_type']}
        filter={request_filter}
        request_type={`${DISPLAY_PROVIDER}`} 
        />);
    //`
    
  }

  
}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:     loginRedux.actualRoleId(state),
        actualRole:       loginRedux.actualRole(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)( injectIntl(ProvidersPayments)))
);
