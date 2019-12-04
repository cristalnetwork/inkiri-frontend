import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as form_helper from '@app/components/Form/form_helper';
import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Card, PageHeader, Tag, Tabs, Button, Form, Input, Icon} from 'antd';
import { Modal, notification, Table, Divider, Spin } from 'antd';


import ServiceContractChargeForm from '@app/components/Form/service_contract_charge';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

import * as eos_table_getter from '@app/services/inkiriApi/table_getters';

const STATE_LIST_CONTRACTS_PAYMENTS = 'state_list_contracts_payments';
const STATE_NEW_CHARGE              = 'state_new_charge';

const titles = {
  [STATE_LIST_CONTRACTS_PAYMENTS]   : 'Cobranzas'
  , [STATE_NEW_CHARGE]              : 'Cobrar servicio'
}

class ServiceContractsPaymments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:            false,
      pushingTx:          false,
      
      contract:           props.location.state.contract,
      service:            props.location.state.service,

      payments:           [],
      
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      cursor:             null,

      active_view:        STATE_LIST_CONTRACTS_PAYMENTS,
      active_view_object: null,


    };

    this.loadServiceContractsPayments  = this.loadServiceContractsPayments.bind(this);  
    this.openNotificationWithIcon       = this.openNotificationWithIcon.bind(this); 
    this.onPaymentCallback              = this.onPaymentCallback.bind(this);
    this.getColumns                     = this.getColumns.bind(this);
    this.renderFooter                   = this.renderFooter.bind(this); 
    this.onNewData                      = this.onNewData.bind(this); 
    this.goBack                         = this.goBack.bind(this); 
  }
  goBack(){
    this.props.history.goBack();
  }

  getColumns(){
    return columns_helper.columnsForServiceContractPayment(this.onPaymentCallback);
  }
  
  

  componentDidMount = async () => {

    const { location } = this.props;
    if(location && location.state)
    {
      this.setState({
        contract:        location.state.contract,
        service:         location.state.service,
        referrer:        location.state.referrer
      }, async () => {
          
          const _y_dummy = await this.loadServiceContractsPayments();  
      });
    }
    else
    {
      
      const y_dummy = await this.loadServiceContractsPayments();  
    }
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    // if(prevProps.referrer !== this.props.referrer) {
    //   this.setState({
    //     referrer         : this.props.referrer,
    //     contract         : this.props.contract,
    //     service          : this.props.service
    //   });
    // }

  }

  
  
  onPaymentCallback(contract, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
    }
    return;

  }

  
  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
      });    
  }

  reloadServiceContractsPayments = async () => {

    this.setState({
        can_get_more:  true, 
        payments:      [],
        cursor:        null
      }, async () => {
        const dummy_2 = await this.loadServiceContractsPayments(true);

      });  
  }

  loadServiceContractsPayments = async (is_first) => {

    const {contract, service, can_get_more, cursor} = this.state;
    const me = this.props.actualAccountName;
    this.setState({loading:true});

    if(!can_get_more)
    {
      this.openNotificationWithIcon("info", "Nope!");
      this.setState({loading:false});
      return;
    }

    let payments = null;

    const provider_account = contract.provider||contract.to;
    const customer_account = contract.account||contract.from;
    
    // console.log('contract:', contract)
    // console.log('service:', service)
    // console.log('customer:', customer_account, 'provider:',provider_account);
    

    try{
      payments = await api.dfuse.listPAPPayments(me, provider_account, customer_account, cursor);
    }catch(e){
      this.openNotificationWithIcon('error', 'An error occurred while fetching contracts.', JSON.stringify(e))
      
      this.setState({loading:false});  
      return;
    }

    this.onNewData(payments);
    
  }
  onNewData(payments){
    
    console.log('payments: ', payments)
    
    const _payments       = [...this.state.payments, ...payments.data.txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _payments.length;
    pagination.total      = _payments.length;

    const has_received_new_data = (payments && payments.data && payments.data.txs.length>0);

    this.setState({
                  pagination:    pagination, 
                  payments:      _payments, 
                  can_get_more:  (payments.cursor)?true:false,
                  cursor:        payments.cursor, 
                  loading:       false})

    if(!has_received_new_data && _payments && _payments.length>0)
    {
      this.openNotificationWithIcon("info", "End of services list")
    }
    // else
    //   this.computeStats();
  }


  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events
  
  render() {
    const content                         = this.renderContent();
    const contract_info                   = this.renderContractInfo();
    const {loading, active_view} = this.state;
    const title                          = titles[active_view] || titles[STATE_LIST_CONTRACTS_PAYMENTS];
    const buttons = (active_view==STATE_LIST_CONTRACTS_PAYMENTS)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServiceContractsPayments()} ></Button>]
        :[];
    //

    // const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    // const routes    = routesService.breadcrumbForPaths([this.props.location.pathname]);
    // breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
    return (
      <>
        <PageHeader
          extra={buttons}
          title={title}
          onBack={()=>this.goBack()}
        >
          
        </PageHeader>
          
          {contract_info}
          {content}
        
      </>
    );
  }
  //
  renderContractInfo(){
    const {service} = this.state;  
    const {title, description, amount, state} = service;  
    let provider = null;
    if(service.created_by.account_name!=this.props.actualAccountName){
      provider = stats_helper.buildItemSimple('PROVIDER', service.created_by.account_name)
    }
    const items = [
        provider 
        , stats_helper.buildItemSimple('SERVICE', title)
        , stats_helper.buildItemSimple('DESC.', description)
        , stats_helper.buildItemMoney('PRICE', amount)
        // , stats_helper.buildItemSimple('STATE', state)
      ]
    return (<div style={{ background: '#fff', padding: 24, marginTop: 24}}>
        <TableStats stats_array={items}/>
      </div>)
  }
  
  //

  renderContent(){
    const {contract, service, loading, active_view } = this.state;

    
    //if(active_view==STATE_LIST_CONTRACTS_PAYMENTS)  
    const {payments} = this.state;
    return (
      <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          <div style={{ background: '#fff', minHeight: 360, marginTop: 12}}>
            <Table
                key="table_service_contract_payments" 
                rowKey={record => record.id} 
                loading={this.state.loading} 
                columns={this.getColumns()} 
                dataSource={payments} 
                footer={() => this.renderFooter()}
                pagination={this.state.pagination}
                scroll={{ x: 700 }}
                />
          </div>
        </Card>
      )
  }
  //
  renderFooter = () => {
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadServiceContractsPayments(false)}>More!!</Button> </>)
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
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(ServiceContractsPaymments))
);