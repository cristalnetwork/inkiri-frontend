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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Card, PageHeader, Button, Table } from 'antd';

import {DISPLAY_ALL_TXS, DISPLAY_PROVIDER, DISPLAY_EXCHANGES} from '@app/components/TransactionTable';
import TableStats, { buildItemMoneyPending, buildItemUp, buildItemDown, buildItemCompute, buildItemSimple, buildItemMoney, buildItemPending} from '@app/components/TransactionTable/stats';
import * as columns_helper from '@app/components/TransactionTable/columns';

import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';

import * as gqlService from '@app/services/inkiriApi/graphql'
import IuguFilter from '@app/components/Filters/iugu';

import * as request_helper from '@app/components/TransactionCard/helper';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

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

      filter:         {},
      stats:          {
                        processed: 0 
                        , waiting:0 
                        , error:0 
                        , total:0
                        , count:0
                      },
      
    };

    this.loadInvoices            = this.loadInvoices.bind(this);  
    this.renderFooter            = this.renderFooter.bind(this); 
    this.onNewData               = this.onNewData.bind(this);
    this.onInvoiceClick          = this.onInvoiceClick.bind(this);
    this.iuguFilterCallback      = this.iuguFilterCallback.bind(this);

    this.myExportRef    = React.createRef();
    this.timeout_id     = null;   
  }
  
  componentDidMount(){
    this.loadInvoices();  
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
        this.loadInvoices();
      });  
  }
  //
  getInvoicesFilter = (increase_page_if_needed) => {
    const page             = (this.state.page<=0)
      ?0
      :(increase_page_if_needed)
        ?(this.state.page+1)
        :this.state.page;

    const {limit, filter}  = this.state;
    
    return {limit:limit.toString(), page:page.toString(), ...filter};
  }
  //
  loadInvoices = async () => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let that      = this;
    const filter = this.getInvoicesFilter(true);
    try{
      const data = await gqlService.iugus(filter);
      console.log(data)
      that.onNewData(data);
    }
    catch(ex){
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'pages.bankadmin.iugu.error_loading'}), ex);
      that.setState({loading:false});  
    }
    // api.bank.listIuguInvoices(page, limit)
    // .then( (res) => {
    //     that.onNewData(res);
    //   } ,(ex) => {
    //     // console.log('---- ERROR:', JSON.stringify(ex));
    //     that.setState({loading:false});  
    //   } 
    // );
    
  }

  onNewData(txs){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    const page           = (this.state.page<0)?0:(this.state.page+1);
    this.setState({pagination:    pagination
                , txs:             _txs
                , can_get_more:   (has_received_new_data && txs.length==this.state.limit)
                , loading:        false
                , page:           page})

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
    let stats = this.state.stats;
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
    
    stats = {
        processed : processed
        , waiting : waiting
        , error : error
        , total : total
        , count:       txs.length
       };

    this.setState({stats:stats})

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
    
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadInvoices()}>
        {this.props.intl.formatMessage({id:'pages.bankadmin.iugu.more_invoices'})}
      </Button> </>)
  }

  iuguFilterCallback = (error, cancel, values, refresh) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    if(refresh)
    {
      clearTimeout(this.timeout_id);
      this.timeout_id = setTimeout(()=> {
        this.reloadTxs();
      } ,100);
      return;
    }
    
    console.log(' iuguFilter: ', JSON.stringify(values));
    /*
      {"state":"state_error","to":"centroinkiri","date_from":"2020-01-02T00:13:52.742Z","date_to":"2020-01-25T00:13:52.742Z"}
    */

    
    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=> {
      this.setState({filter:(values||{})}, ()=>{
        this.reloadTxs();
      })
    } ,100);
    
  }

  exportButton = () => [<a className="hidden" key="export_button_dummy" ref={this.myExportRef}  href={this.state.sheet_href} target="_blank" >x</a>, <Button key="export_button" onClick={this.handleExportClick} size="small" style={{position: 'absolute', right: '8px', top: '16px'}} title={this.props.intl.formatMessage({id:'global.export_sheet_remember_allowing_popups'})}><FontAwesomeIcon icon="file-excel" size="sm" color="black"/>&nbsp;<InjectMessage id="global.export_list_to_spreadsheet" /></Button>];
  //
  handleExportClick = async () => {

    const filter = this.getInvoicesFilter(false);
      
    console.log(filter)
    if(!filter)
      return;

    this.setState({loading:true});
    const that       = this;
    try{
      const data = await gqlService.exportIugus(filter);
      
      this.setState({loading:false});
      console.log(data)
      if(data && data.file_id)
      {
        console.log('SETTING STATE')
        this.setState( { sheet_href: `https://docs.google.com/spreadsheets/d/${data.file_id}` }
                        , () => { 
                          console.log('CALLING BUTTON?')
                         if(!this.myExportRef)    
                            return;
                          console.log('YES')
                          this.myExportRef.current.click();
                        });
        
        return;
      } 
      console.log('NOooooooooooooooo')
      if(data && data.error)
      {
        components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), data.error);
        return;
      }
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}));
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), e);
      return;
    }

    this.setState({loading:false});
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
          <IuguFilter 
            callback={this.iuguFilterCallback} />
          {stats}
          {content}
        </Card>
      </>
    );
  }
//

  renderTableViewStats(){
    const {processed, waiting, error, total, count} = this.state.stats;  
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
          <ResizeableTable
            title = { () => this.exportButton() }
            key="table_all_requests" 
            rowKey={record => record._id} 
            loading={this.state.loading} 
            columns_def={this.getColumns()} 
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