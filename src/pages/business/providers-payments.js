import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

// import * as userRedux from '@app/redux/models/user';
import * as loginRedux from '@app/redux/models/login'
import * as menuRedux from '@app/redux/models/menu';

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import * as routesService from '@app/services/routes';
import { withRouter } from "react-router-dom";
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Tag, Tabs, Button, Table, Divider, Spin } from 'antd';

import {DISPLAY_PROVIDER} from '@app/components/TransactionTable';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import { injectIntl } from "react-intl";

class Providers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :         routesService.breadcrumbForPaths(props.location.pathname),
      loading:         false,
      txs:             [],
      page:            -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:                        {},
    };

    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onNewRequestClick          = this.onNewRequestClick.bind(this);
    this.onProcessRequestClick      = this.onProcessRequestClick.bind(this);
    this.operationDetails           = this.operationDetails.bind(this);
    this.cancelOperation            = this.cancelOperation.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
  }
  
  cancelOperation(record){}
  
  operationDetails(record){
    // HACK
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: '/common/request-details'
      , state: { 
          request: record 
          , referrer: this.props.location.pathname
        }
    })
  }

  getColumns(){
    return columns_helper.getColumnsForRequests(this.operationDetails);
  }
  //
  onNewRequestClick(){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/providers-payments-request`
      , state: { 
          referrer: this.props.location.pathname
        }
    })
  }

  onProcessRequestClick(request){
    console.log( ' EXTRATO::onProcessRequestClick >> ', JSON.stringify(request) )
  }

  componentDidMount(){
    this.loadProviderTxs(true);
  } 

  reloadData(){
    this.setState({
        page:        -1, 
        txs:    [],
      }, () => {
        this.loadProviderTxs(true);
      });  
  }

  loadProviderTxs = async (first_call) => {
    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page                = (this.state.page<0)?0:(this.state.page+1);
    const {limit, provider} = this.state;
    let that                = this;
    
    // const req_type = DISPLAY_PROVIDER;
    
    api.bank.listMyRequests(this.props.actualAccountName, page, limit, DISPLAY_PROVIDER)
    .then( (res) => {
        that.onNewData(res, first_call);
        // console.log('---- listMyRequests:', JSON.stringify(res));
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
  }

  onNewData(txs, first_call){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    this.setState({pagination:pagination, txs:_txs, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data && !first_call)
    {
      const {formatMessage} = this.props.intl;
      components_helper.notif.infoNotification(
        formatMessage({id:'pages.business.providers-payments.end_of_list'})
        , formatMessage({id:'pages.business.providers-payments.end_of_list_message'}) 
      );
    }
    
  }

  //
  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProviderTxs()}>
        {this.props.intl.formatMessage({id:'pages.business.providers-payments.load_more_payment_requests'})}
      </Button> </>)
  }

  render() {
    const {routes, loading} = this.state; 
    return (
      <>
        <PageHeader
          extra={[
            <Button key="refresh" size="small" icon="redo" disabled={loading} onClick={()=>this.reloadData()} ></Button>,
            
          ]}
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.business.providers-payments.title'})}
        >
        </PageHeader>
        
        <div style={{ margin: '0 0px', paddingLeft: 12, paddingRight: 12, paddingBottom: 12, background: '#fff', height: 'auto', marginTop: 0  }}>
          <Table
            key={"table_"+DISPLAY_PROVIDER} 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
        </div>
      </>
    );
  }
}

export default  (withRouter(connect(
    (state)=> ({
        actualAccountName: loginRedux.actualAccountName(state),
        actualRole:        loginRedux.actualRole(state),
        actualRoleId:      loginRedux.actualRoleId(state)
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Providers))));