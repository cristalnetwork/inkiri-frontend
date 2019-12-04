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

const STATE_LIST_CONTRACTS         = 'state_list_contracts';
const STATE_NEW_CHARGE             = 'state_new_charge';

const titles = {
  [STATE_LIST_CONTRACTS]           : 'Service contracts'
  , [STATE_NEW_CHARGE]             : 'Cobrar servicio'
}

class ServiceContracts extends Component {
  constructor(props) {
    super(props);
    const props_provider = (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : null;
    const props_service  = (props && props.location && props.location.state && props.location.state.service)? props.location.state.service : null;
    this.state = {
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:            false,
      pushingTx:          false,
      
      provider:           props_provider || props.actualAccountProfile,
      service:            props_service || null,

      contracts:          [],
      
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      cursor:             null,

      active_view:        STATE_LIST_CONTRACTS,
      active_view_object: null,


    };

    this.loadServiceContracts         = this.loadServiceContracts.bind(this);  
    this.openNotificationWithIcon     = this.openNotificationWithIcon.bind(this); 
    this.onContractListCallback       = this.onContractListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
    this.onNewContract                = this.onNewContract.bind(this); 
    this.ServiceContractChargeCallback  = this.ServiceContractChargeCallback.bind(this);
    this.renderFooter                 = this.renderFooter.bind(this); 
    this.onNewData                    = this.onNewData.bind(this); 
    this.goBack                         = this.goBack.bind(this); 
  }
  goBack(){
    this.props.history.goBack();
  }

  getColumns(){
    return columns_helper.columnsForServiceContract(this.onContractListCallback);
  }
  
  componentDidMount = async () => {

    const { location } = this.props;
    if(location && location.state)
    {
      this.setState({
          provider: location.state.provider || this.props.actualAccountProfile,
          service:  location.state.service
      }, async () => {
          
          const _y_dummy = await this.loadServiceContracts();  
      });
    }
    else
    {
      
      const y_dummy = await this.loadServiceContracts();  
    }
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    if(prevProps.referrer !== this.props.referrer) {
      this.setState({
        referrer         : this.props.referrer,
      });
    }

    const {provider, service, actualAccountProfile} = this.props;
    if(prevProps.provider !== provider) {
      this.setState({ provider:provider || actualAccountProfile, service: service});
    }
  }

  onNewContract = () => {
    
    this.openNotificationWithIcon("warning", "Not implemented yet");    
    // this.setState({active_view:STATE_NEW_SERVICE})
  }

  
  onContractListCallback(contract, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
      case events.REMOVE:
        this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
      case events.EDIT:
        // console.log(event)
        // this.setState({active_view: STATE_EDIT_SERVICE, active_view_object:service})
        break;
      case events.DISABLE:
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        // this.onDisableService(service);
        break;
      case events.CHILDREN:
        // this.props.setLastRootMenuFullpath(this.props.location.pathname);
        this.props.history.push({
          pathname: `/common/service-contract-payments`
          , state: { 
              referrer: this.props.location.pathname
              , contract: contract
              , service:  this.state.service            
            }
        });

        break;
      case events.NEW_CHILD:
        // this.setState({active_view: STATE_NEW_SERVICE_CONTRACT, active_view_object:service})
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
      case events.CHARGE:
        this.setState({active_view: STATE_NEW_CHARGE, active_view_object:contract})
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
    }
    return;

  }

  ServiceContractChargeCallback= async (error, cancel, values) => {
    
    if(cancel)
    {
      this.setState({active_view:STATE_LIST_CONTRACTS});
      return;
    }

    if(error)
    {
      return;
    }

    const that                                           = this;
    const sender                                         = that.props.actualAccountName;
    const private_key                                    = this.props.actualPrivateKey;
    const {contract}                                     = values;
    const {account, provider, service_id, last_charged}  = contract;
    const period_to_charge                               = last_charged+1;

    that.setState({pushingTx:true});

    let customer_balance = null;
    try{
      customer_balance = await api.getAccountBalance(account);
    }catch(e){
      that.openNotificationWithIcon("error", 'It seems the customer has no balance!');
      that.setState({pushingTx:false});
      return;
    }

    if(globalCfg.currency.toNumber(customer_balance.data.balance)<=globalCfg.currency.toNumber(contract.price))
    {
        that.setState({pushingTx:false});
        that.openNotificationWithIcon("error", 'It seems the customer you are trying to charge has not enough balance to pay the bill.');
        console.log(customer_balance);
        return;
    }

    console.log(sender, private_key, account, provider, service_id, period_to_charge);

    api.chargeService(sender, private_key, account, provider, service_id, contract.price, period_to_charge)
      .then((res)=>{
        console.log(' >> doCharge >> ', JSON.stringify(res));
        that.setState({pushingTx:false, result:'ok'})
        that.openNotificationWithIcon("success", 'Service charged successfully');
        setTimeout(()=>that.setState({active_view:STATE_LIST_CONTRACTS}),1000);
      }, (err)=>{
        that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
        console.log(JSON.stringify(err));
        that.setState({result:'error', error:err, pushingTx:false});
      })
        
    
  }

  
  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
      });    
  }

  reloadServiceContracts = async () => {

    this.setState({
        page:        -1, 
        contracts:    [],
        cursor:       null
      }, async () => {
        const dummy_2 = await this.loadServiceContracts(true);

      });  
  }

  loadServiceContracts = async (is_first) => {

    const {page, provider, service, can_get_more, cursor} = this.state;

    // if(!can_get_more)
    // {
    //   this.openNotificationWithIcon("info", "Nope!");
    //   this.setState({loading:false});
    //   return;
    // }

    this.setState({loading:true});

    let contracts = null;

    console.log(provider.account_name, service.serviceCounterId);
    
    try{
      // contracts = await eos_table_getter.papByProviderService(provider.account_name, service.serviceCounterId, (is_first===true?undefined:cursor) );
      contracts = await eos_table_getter.papByProviderService(provider.account_name, parseInt(service.serviceCounterId), 0);
    }catch(e){
      this.openNotificationWithIcon('error', 'An error occurred while fetching contracts.', JSON.stringify(e))
      
      this.setState({loading:false});  
      return;
    }

    this.onNewData(contracts);
    
  }
  onNewData(contracts){
    
    console.log('contracts: ', contracts)
    
    const _contracts       = [...this.state.contracts, ...contracts.rows];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _contracts.length;
    pagination.total      = _contracts.length;

    const has_received_new_data = (contracts && contracts.rows.length>0);

    this.setState({
                  pagination:pagination, 
                  contracts:_contracts, 
                  cursor:contracts.next_key, 
                  loading:false})

    if(!has_received_new_data && _contracts && _contracts.length>0)
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
    const content                        = this.renderContent();
    const service_info                   = this.renderServiceInfo();
    const {loading, active_view} = this.state;
    const title                          = titles[active_view] || titles[STATE_LIST_CONTRACTS];
    const buttons = (active_view==STATE_LIST_CONTRACTS)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServiceContracts()} ></Button>]
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
          
          {service_info}
          {content}
        
      </>
    );
  }
  //
  renderServiceInfo(){
    const {title, description, amount, state} = this.state.service;  
    const items = [
        stats_helper.buildItemSimple('SERVICE', title)
        , stats_helper.buildItemSimple('DESC.', description)
        , stats_helper.buildItemMoney('PRICE', amount)
        , stats_helper.buildItemSimple('STATE', state)
      ]
    return (<div style={{ background: '#fff', padding: 24, marginTop: 24}}>
        <TableStats stats_array={items}/>
      </div>)
  }
  //
  renderContent(){
    const {provider, service, loading, active_view, active_view_object } = this.state;

    if(active_view==STATE_NEW_CHARGE)
    {
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <ServiceContractChargeForm key="charge_next_form" 
                  callback={this.ServiceContractChargeCallback} 
                  contract={active_view_object} 
                  service={service}
                  provider={provider} />    
              </Spin>
            </section>
          </div>      
        </div>);
    }


    //if(active_view==STATE_LIST_SERVICES)  
    const {contracts} = this.state;
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
                key="table_service_contracts" 
                rowKey={record => record.id} 
                loading={this.state.loading} 
                columns={this.getColumns()} 
                dataSource={contracts} 
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
    return (<><Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadServiceContracts(false)}>More!!</Button> </>)
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
)(ServiceContracts))
);