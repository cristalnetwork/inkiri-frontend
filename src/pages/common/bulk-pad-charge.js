import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as apiRedux from '@app/redux/models/api';

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as form_helper from '@app/components/Form/form_helper';
import * as columns_helper from '@app/components/TransactionTable/columns';
import { Card, PageHeader, Button} from 'antd';
import { Modal, Table, Spin } from 'antd';
import { ResizeableTable } from '@app/components/TransactionTable/resizable_columns';

import * as eos_table_getter from '@app/services/inkiriApi/eostable-getters';
import * as gqlService from '@app/services/inkiriApi/graphql'

import { injectIntl } from "react-intl";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class BulkPADCharge extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
      pads:               [],
      page:               -1, 
      limit:              1000,
      can_get_more:       true,
      charging:           false,      
      intl:               {}

    };

    this.loadPADs         = this.loadPADs.bind(this);  
    this.getColumns       = this.getColumns.bind(this);
    this.onNewData        = this.onNewData.bind(this); 

  }

  getColumns(){
    return columns_helper.columnsForCustomers();
  }
  
  componentDidMount = async () => {

    const {formatMessage} = this.props.intl;
    const load_more_services = formatMessage({id:'pages.common.services.load_more_services'});
    const bulk_pad_charge_title = formatMessage({id:'pages.common.bulk_pad_charge.title'});
    const end_of_services_list = formatMessage({id:'pages.common.services.end_of_services_list'});
    const error_retrieving_services = formatMessage({id:'pages.common.services.error_retrieving_services'});
    const bulk_action_charge = formatMessage({id:'pages.common.service_contracts.bulk_action_charge'});
    const error_customer_has_no_balance = formatMessage({id:'pages.common.service_contracts.error_customer_has_no_balance'});
    const error_customer_not_enough_balance = formatMessage({id:'pages.common.service_contracts.error_customer_not_enough_balance'});
    this.setState({intl:{error_customer_not_enough_balance, error_customer_has_no_balance, bulk_action_charge, error_retrieving_services, end_of_services_list, load_more_services, bulk_pad_charge_title}});

    this.loadPADs();
    
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const that          = this;
      const {active_view} = this.state;
      
      setTimeout(()=> {
          that.loadPADs();
          that.resetPage();
        },250);
    }
  }
  
  resetPage(){
    this.setState({ 
         pushingTx:   false
      });    
  }

  loadPADs = async () => {

    try{
      let   pads        = await eos_table_getter.listPapByProvider(this.props.actualAccountName);
      const service_ids = pads.rows.reduce((acc, pad) => { if(!acc.includes(pad.service_id)) acc.push(pad.service_id); return acc; } , []);
      const services    = await gqlService.services({account_name:this.props.actualAccountName, serviceCounterId:service_ids.join(',')});
      pads.rows = pads.rows.map(pad => {
        pad.service = services.find(service=>service.serviceCounterId = pad.service_id);
        pad.info    = api.pap_helper.getChargeInfo(pad)
        return pad;
      });
      this.onNewData (pads) ;
    }catch(e){
      components_helper.notif.exceptionNotification(this.state.intl.error_retrieving_services, e);
    }  

  }
  /*
  {rows: Array(2), more: false, next_key: ""}

  [{
    account: "pablotutino2"
    begins_at: "2020-01-01T03:00:00"
    enabled: 1
    id: 0
    last_charged: 0
    periods: 8
    price: "25.0000 INK"
    provider: "organicvegan"
    service_id: 5
  }]
  */
  onNewData(pad_result){
    
    const pads            = pad_result.rows;
    const _pads           = [...this.state.pads, ...pads];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _pads.length;
    pagination.total      = _pads.length;

    console.log('pad_result:', pad_result)
    console.log('pads:', pads)
    this.setState({
                  pagination:pagination, 
                  pads:_pads, 
                  can_get_more:(pad_result.more && pad_result.next_key), 
                  loading:false})

    if(!pad_result.more)
    {
      components_helper.notif.infoNotification(this.state.intl.end_of_services_list);
    }
  }

  onBulkCharge = async () =>{
    
    const sender      = this.props.actualAccountName;
    const private_key = this.props.actualPrivateKey;
    this.setState({charging:true});
    const that        = this;
    
    const chargablePads = () => this.state.pads.filter( pad => pad.info.days_to_charge<0);

    const charge_promises = chargablePads()
      .map( async (pad, idx) => {
      
        const contract           = pad;
        const {account, provider, service_id, last_charged}  = pad;
        const period_to_charge   = last_charged+1;

        let customer_balance = null;
        try{
          customer_balance = await api.getAccountBalance(account);
        }catch(e){
          // pad.action_result = {
          //   status :     -1,
          //   message:     this.state.intl.error_customer_has_no_balance,
          //   exception:   e,
          // };
          // console.log('NO#1:', pad)
          // return pad;
          return {
            status :     -1,
            message:     this.state.intl.error_customer_has_no_balance,
            exception:   e,
          };
        }

        if(globalCfg.currency.toNumber(customer_balance.data.balance)<=globalCfg.currency.toNumber(contract.price))
        {
          // pad.action_result = {
          //   status :     -1,
          //   message:     this.state.intl.error_customer_not_enough_balance,
          //   exception:   '',
          // };
          // console.log('NO#2:', pad)
          // return pad;
          return {
            status :     -1,
            message:     this.state.intl.error_customer_not_enough_balance,
            exception:   '',
          };
        }

        console.log(sender, private_key, account, provider, service_id, period_to_charge);

        // if(idx!=0)
        //   return {
        //     status :     -1,
        //     message:     'no daba para ejecutar vieja!',
        //     exception:   '',
        //   };
        return api.chargeService(sender, private_key, account, provider, service_id, contract.price, period_to_charge).catch(function(err) {
            return err;
          });

        
      });

    const charge_results = await Promise.all(charge_promises);

    const x = chargablePads();
    const __pads = charge_results.map( (res, idx) => {
      x[idx].result = res;
      return x[idx];
    });

    console.log(charge_results);
    this.setState({charging:false, pads:__pads});
      
      // .then((res)=>{
      //     pad.action_result = {
      //       status :     -1,
      //       message:     this.state.intl.error_customer_not_enough_balance,
      //       exception:   e,
      //     };
      //     console.log('NO:', pad)
      //     return pad;

      //   }, (err)=>{
      //     components_helper.notif.exceptionNotification(this.state.intl.error_unexpected_occurred, err);
      //     console.log(JSON.stringify(err));
      //     that.setState({pushingTx:false});
      //   })
  }

  // Component Events
  
  render() {
    const content             = this.renderContent();
    const {routes, loading}   = this.state;
    const title               = this.state.intl.bulk_pad_charge_title;

    const buttons = [<Button size="small" key="refresh" onClick={this.loadPADs} icon="redo" disabled={loading} ></Button>];
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title={title} />
        
          {content}
        
      </>
    );
  }
  //
  // renderTableHeader = () =>[<a className="hidden" key="export_button_dummy" ref={this.myExportRef} href={this.state.sheet_href} target="_blank" >x</a>
  //   , <Button key="export_button" onClick={this.handleExportClick} size="small" style={{position: 'absolute', right: '8px', top: '16px'}} title={this.props.intl.formatMessage({id:'global.export_sheet_remember_allowing_popups'})}><FontAwesomeIcon icon="file-excel" size="sm" color="black"/>&nbsp;<InjectMessage id="global.export_list_to_spreadsheet" /></Button>];
  renderTableHeader = () => [
    <Button style={{float:'right'}} disabled={this.state.charging} type="primary" key="_charge_all" onClick={()=>{this.onBulkCharge()}}><FontAwesomeIcon icon="hand-holding-usd" color="white"/>&nbsp;{this.state.intl.bulk_action_charge}</Button>
  ];
  //
  renderContent(){
    const {loading } = this.state;
    const {pads} = this.state;
    return (
      <Card
          key="card_table_all_requests"
          className="styles listCard vertical_align_top"
          bordered={false}
          style={{ marginTop: 24 }}
          bodyStyle={{padding: 8}}
          headStyle={{display:'none'}}
        >
          <div style={{ background: '#fff', minHeight: 360, marginTop: 0}}>
            <ResizeableTable 
                title={this.renderTableHeader}
                key="table_pads" 
                rowKey={record => `${record.account}_${record.service_id}`} 
                loading={this.state.loading} 
                columns_def={this.getColumns()} 
                dataSource={pads} 
                footer={this.renderTableHeader}
                pagination={this.state.pagination}
                scroll={{ x: 700 }}
                />
          </div>
        </Card>
      )
  }

  
  

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),

        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state)
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(BulkPADCharge)))
);