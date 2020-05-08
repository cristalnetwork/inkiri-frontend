import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as pageRedux from '@app/redux/models/page'
import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { withRouter } from "react-router-dom";
import * as utils from '@app/utils/utils';
import { Card, PageHeader, Button } from 'antd';

import { DISPLAY_EXCHANGES, DISPLAY_PROVIDER} from '@app/components/TransactionTable';
// import TableStats, { buildItemMoneyPending, buildItemUp, buildItemDown, buildItemCompute, buildItemSimple, buildItemMoney, buildItemPending} from '@app/components/TransactionTable/stats';

import RequestListWidget, {REQUEST_MODE_BANK_TRANSFERS} from '@app/components/request-list-widget';

import { injectIntl } from "react-intl";

class ExternalTransfers extends Component {
  constructor(props) {
    super(props);

    const filter_key = `${props.location.pathname}_filter`;
    const filter     = props.page_key_values && props.page_key_values[filter_key] || {};

    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             false,
      txs:                 [],
      page:                1, 
      limit:               globalCfg.api.default_page_size,
      can_get_more:        true,

      filter_key:          filter_key,
      filter:              filter,
      keep_search:         this.props.location && this.props.location.state && this.props.location.state.keep_search,
      page_key_values:     props.page_key_values,

      stats:               {}
    };

    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    
    if(!utils.objectsEqual(this.state.page_key_values, this.props.page_key_values) )
    {
      const filter     = this.props.page_key_values && this.props.page_key_values[this.state.filter_key] || {};
      new_state = {...new_state, page_key_values: this.props.page_key_values, filter:filter};
    }

    if(Object.keys(new_state).length>0)      
      this.setState(new_state);
  }

  onProcessRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/process-request`
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
        }
    })

  }
  
  //
  render() {
    const {loading, routes, filter, filter_key, keep_search} = this.state;
    const _filter = (keep_search==true)
      ?filter
      :{}
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.bankadmin.external-transfers.title'})}
          subTitle={this.props.intl.formatMessage({id:'pages.bankadmin.external-transfers.title_hint'})}
        />
          
        <Card
          key="card_table_all_requests"
          className="operations"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          <RequestListWidget 
            the_key={filter_key} 
            callback={this.onProcessRequestClick} 
            onRef={ref => (this.table_widget = ref)}
            filter_hidden_fields={['to']}
            filter={_filter}
            mode={REQUEST_MODE_BANK_TRANSFERS}
            request_type={`${DISPLAY_EXCHANGES},${DISPLAY_PROVIDER}`} 
          />
        </Card>
      </>
    );
  }
  

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        page_key_values:      pageRedux.pageKeyValues(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)( injectIntl(ExternalTransfers)))
);
