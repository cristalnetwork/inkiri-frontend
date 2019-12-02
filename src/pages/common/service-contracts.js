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

import ServiceForm from '@app/components/Form/service';
import ServiceContractForm from '@app/components/Form/service_contract';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

import * as eos_table_getter from '@app/services/inkiriApi/table_getters';

const routes = routesService.breadcrumbForFile('accounts');

class ServiceContracts extends Component {
  constructor(props) {
    super(props);
    const props_provider = (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : null;
    const props_service  = (props && props.location && props.location.state && props.location.state.service)? props.location.state.service : null;
    this.state = {
      referrer:           (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
      provider:           props_provider || props.actualAccountProfile,
      service:            props_service || null,

      contracts:          [],
      
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      cursor:             null,

      active_view:        null,
      active_view_object: null,


    };

    this.loadServiceContracts         = this.loadServiceContracts.bind(this);  
    this.openNotificationWithIcon     = this.openNotificationWithIcon.bind(this); 
    this.onContractListCallback       = this.onContractListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
    this.onNewContract                = this.onNewContract.bind(this); 
    this.serviceContractFormCallback  = this.serviceContractFormCallback.bind(this);
    this.renderFooter                 = this.renderFooter.bind(this); 
    this.onNewData                    = this.onNewData.bind(this); 

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

  
  onContractListCallback(service, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
      case events.REMOVE:
        break;
      case events.EDIT:
        // console.log(event)
        // this.setState({active_view: STATE_EDIT_SERVICE, active_view_object:service})
        break;
      case events.DISABLE:
        this.openNotificationWithIcon("warning", "Not implemented yet");    
        this.onDisableService(service);
        break;
      case events.CHILDREN:
        // this.setState({active_view: STATE_LIST_SERVICE_CONTRACTS, active_view_object:service})
        break;
      case events.NEW_CHILD:
        // this.setState({active_view: STATE_NEW_SERVICE_CONTRACT, active_view_object:service})
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        break;
    }
    return;

  }

  serviceContractFormCallback= async (error, cancel, values) => {
    
    if(cancel)
    {
      // this.setState({active_view:STATE_LIST_SERVICES});
      return;
    }

    if(error)
    {
      return;
    }

    console.log(values)
    
    return;

    const that                                       = this;
    const {customer, begins_at, expires_at, periods} = values;
    const sender                                     = that.props.actualAccountName;
    const {provider, active_view_object}             = this.state;
    const service                                    = active_view_object;

    console.log(' >> values:');
    console.log(values);

    console.log( ' >> my data:')
    console.log(' - provider : ', provider);
    console.log(' - customer : ', customer)
    console.log(' - service : ', service)
    console.log(' - begins_at : ', begins_at)
    console.log(' - expires_at : ', expires_at)

    // 1 check if service is already been provisioned to customer:
    const customer_account_name = customer;
    const service_id_num        = service.serviceCounterId;

    const byCustServ = await eos_table_getter.papByUInt128(customer_account_name
        , service_id_num
        , eos_table_getter.INDEX_POSITION_PAP_BY_CUSTOMER_SERVICE);
    console.log('byCustServ', byCustServ)

    if(byCustServ && byCustServ.length>0)
    {
      that.openNotificationWithIcon("error", 'Duplicated customer service provisioning', 'Customer account is already hiring selected service.');
      return;
    }

    Modal.confirm({
      title: 'Confirm service provisioning request',
      content: (<p>You will invite <b>{customer}</b> to accept <b>{service.title}</b> service, 
                  at a <b>{globalCfg.currency.toCurrencyString(service.amount)}</b> monthly price bases, 
                  for <b>{periods}</b> periods/months, begining at <b>{begins_at.format(form_helper.MONTH_FORMAT)}</b></p>),
      onOk() {
        const {input_amount} = that.state;
        that.setState({pushingTx:true});
        api.bank.sendServiceRequest(provider, customer, service, begins_at, expires_at)
          .then((res)=>{
            console.log(' >> doDeposit >> ', JSON.stringify(res));
            that.setState({pushingTx:false, result:'ok'})
            that.openNotificationWithIcon("success", 'Service provisioning requested successfully');

          }, (err)=>{
            that.openNotificationWithIcon("error", 'An error occurred', JSON.stringify(err));
            that.setState({result:'error', error:err, pushingTx:false});
          })
        
      },
      onCancel() {
        console.log('Cancel');
        that.setState({pushingTx:false})
      },
    });
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
        services:    [],
      }, async () => {
        const dummy_2 = await this.loadServiceContracts();

      });  
  }

  loadServiceContracts = async (is_first) => {

    const {page, provider, service, can_get_more, cursor} = this.state;

    this.setState({loading:true});

    let contracts = null;

    console.log(provider.account_name, service.serviceCounterId);
    
    try{
      // contracts = await eos_table_getter.papByProviderService(provider.account_name, service.serviceCounterId, (is_first===true?undefined:cursor) );
      contracts = await eos_table_getter.papByProviderService(provider.account_name, parseInt(service.serviceCounterId), 1);
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
    const title                          = 'Customers';
    const buttons = (active_view=='STATE_LIST_SERVICES')
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServiceContracts()} ></Button>, 
        <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewContract()}}> Service</Button>]
        :[];
    //
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title={title}

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
        stats_helper.buildItemSimple('DESC', description)
        , stats_helper.buildItemMoney('PRICE', amount)
        , stats_helper.buildItemSimple('STATE', state)
      ]
    return (<TableStats title={title} stats_array={items}/>)
  }
  //
  renderContent(){
    const {provider, loading, active_view, active_view_object, services_states } = this.state;

    // if(active_view==STATE_NEW_SERVICE_CONTRACT)
    // {
    //   return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
    //       <div className="ly-main-content content-spacing cards">
    //         <section className="mp-box mp-box__shadow money-transfer__box">
    //           <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
    //             <ServiceContractForm key="edit_service_form" 
    //               callback={this.serviceContractFormCallback} 
    //               services_states={services_states} 
    //               service={active_view_object}
    //               provider={provider} />    
    //           </Spin>
    //         </section>
    //       </div>      
    //     </div>);
    // }


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
          <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
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
    return (<><Button key="load-more-data" disabled={this.state.cursor==''} onClick={()=>this.loadServiceContracts(false)}>More!!</Button> </>)
  }
  

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(ServiceContracts))
);