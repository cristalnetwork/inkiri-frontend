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

import { DISPLAY_DEPOSIT, DISPLAY_WITHDRAWS} from '@app/components/TransactionTable';
// import TableStats, { buildItemMoneyPending, buildItemUp, buildItemDown, buildItemCompute, buildItemSimple, buildItemMoney, buildItemPending} from '@app/components/TransactionTable/stats';

import RequestListWidget from '@app/components/request-list-widget';

import { injectIntl } from "react-intl";

class PDA extends Component {
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

    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
  }
  
  onProcessRequestClick(request){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/pda-process-request`
      , state: { 
          request: request 
          , referrer: this.props.location.pathname
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
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadTxs()} ></Button>,
            <Button size="small" key="_new_deposit"  icon="plus" disabled> {this.props.intl.formatMessage({id:'pages.bankadmin.pda.deposit'})}</Button>,
            <Button size="small" key="_new_withdraw" icon="plus" disabled> {this.props.intl.formatMessage({id:'pages.bankadmin.pda.withdraw'})}</Button>,
          ]}
          title={this.props.intl.formatMessage({id:'pages.bankadmin.pda.title'})}
          subTitle={this.props.intl.formatMessage({id:'pages.bankadmin.pda.title_hint'})}
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
    return (<RequestListWidget 
        the_key={'pda_wodget_key'} 
        callback={this.onProcessRequestClick} 
        onRef={ref => (this.table_widget = ref)}
        filter_hidden_fields={['to']}
        request_type={`${DISPLAY_DEPOSIT},${DISPLAY_WITHDRAWS}`} 
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
)( injectIntl(PDA)))
);
