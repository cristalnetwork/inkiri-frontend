import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Card, PageHeader, Button, Table } from 'antd';

import {DISPLAY_ALL_TXS, DISPLAY_PROVIDER, DISPLAY_EXCHANGES} from '@app/components/TransactionTable';
import TableStats, { buildItemMoneyPending, buildItemUp, buildItemDown, buildItemCompute, buildItemSimple, buildItemMoney, buildItemPending} from '@app/components/TransactionTable/stats';
import * as columns_helper from '@app/components/TransactionTable/columns';

import * as request_helper from '@app/components/TransactionCard/helper';

import { injectIntl } from "react-intl";

class Iugu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      txs:            [],
      
      page:           -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,

      stats:          {},
      active_tab:     DISPLAY_ALL_TXS
    };

    this.loadExternalTxs            = this.loadExternalTxs.bind(this);  
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onInvoiceClick             = this.onInvoiceClick.bind(this);
  }
  
  componentDidMount(){
    this.loadExternalTxs();  
  } 

  getColumns(){
    return columns_helper.columnsForIUGU(this.onInvoiceClick);
  }
  //
  reloadTxs(){
    this.setState({
        page:   -1, 
        txs:    [],
      }, () => {
        this.loadExternalTxs();
      });  
  }
  //
  loadExternalTxs(){

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    let that           = this;
    
    const req_type = DISPLAY_EXCHANGES + '|' + DISPLAY_PROVIDER;
    const account_name = undefined;
    
    api.bank.listIuguInvoices(page, limit)
    .then( (res) => {
        that.onNewData(res);
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(txs){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    this.setState({pagination:pagination, txs:_txs, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data)
    {
      components_helper.notif.infoNotification( 
        this.props.intl.formatMessage({id:'pages.bankadmin.iugu.end_of_invoices'}),
        this.props.intl.formatMessage({id:'pages.bankadmin.iugu.end_of_invoices_message'})
      );
    }
    else
      this.computeStats();
  }

  
  computeStats(txs){
    let stats = this.currentStats();
    if(txs===undefined)
      txs = this.state.txs;
    const processed = txs.filter( tx => request_helper.iugu.isIssued(tx))
                      .map(tx =>tx.amount)
                      .reduce((acc, amount) => acc + Number(amount), 0);
    const waiting   = txs.filter( tx => request_helper.iugu.isProcessing(tx))
                      .map(tx =>tx.amount)
                      .reduce((acc, amount) => acc + Number(amount), 0);
    
    const error     = txs.filter( tx => request_helper.iugu.inError(tx))
                      .map(tx =>tx.amount)
                      .reduce((acc, amount) => acc + Number(amount), 0);
    
    const total     = error+waiting+processed;
    
    stats[this.state.active_tab] = {
        processed : processed
        , waiting : waiting
        , error : error
        , total : total
        , count:       txs.length
       };

    this.setState({stats:stats})
  }

  currentStats(){
    const x = this.state.stats[this.state.active_tab];
    const _default = {processed: 0 
                  , waiting:0 
                  , error:0 
                  , total:0
                  , count:0};
    return x?x:_default;
  }

  // Component Events
  
  onInvoiceClick(invoice){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    // ToDo: Move to common
    this.props.history.push({
      pathname: `/${this.props.actualRole}/iugu-invoice`
      , state: { 
          invoice:  invoice, 
          referrer: this.props.location.pathname
        }
    })

  }

  renderFooter(){
    
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadExternalTxs()}>
        {this.props.intl.formatMessage({id:'pages.bankadmin.iugu.more_invoices'})}
      </Button> </>)
  }

  
  render() {
    //
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={this.props.intl.formatMessage({id:'pages.bankadmin.iugu.title'})}
          extra={[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadTxs()} ></Button>,]}
          />
          
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {stats}
          {content}
        </Card>
      </>
    );
  }
//

  renderTableViewStats(){
    const {processed, waiting, error, total, count} = this.currentStats();  
    const {formatMessage} = this.props.intl;
    const items = [
        buildItemMoney(formatMessage({id:'pages.bankadmin.iugu.stats.issued'}), processed)
        , buildItemMoneyPending(formatMessage({id:'pages.bankadmin.iugu.stats.pending'}), waiting)
        , buildItemMoney(formatMessage({id:'pages.bankadmin.iugu.stats.error'}), error, '#cf1322')
        , buildItemMoney(formatMessage({id:'pages.bankadmin.iugu.stats.total'}), total)
        , buildItemSimple(formatMessage({id:'pages.bankadmin.iugu.stats.payments'}), count)
        
      ]
    return (<TableStats title={formatMessage({id:'pages.bankadmin.iugu.stats.stats'})} stats_array={items}/>)
  }

  renderContent(){
    return (<div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
          <Table
            key="table_all_requests" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
          </div>);
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
)(injectIntl(Iugu)))
);