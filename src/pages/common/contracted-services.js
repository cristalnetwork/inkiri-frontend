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

const STATE_LIST_SERVICES          = 'state_list_services';
const STATE_NEW_SERVICE            = 'state_new_service';
const STATE_EDIT_SERVICE           = 'state_edit_service';
const STATE_NEW_SERVICE_CONTRACT   = 'state_new_service_contract';
const STATE_EDIT_SERVICE_CONTRACT  = 'state_edit_service_contract';
const STATE_LIST_SERVICE_CONTRACTS = 'state_list_service_contracts';
const STATE_VIEW_SERVICE_CONTRACT  = 'state_view_service_contract';

const CONTRACTED_SERVICES         = 'contracted-services';
const OFFERED_SERVICES            = 'services';

const titles = {
  [OFFERED_SERVICES]            :{
    [STATE_LIST_SERVICES]            : 'Serviços oferecidos'
    , [STATE_NEW_SERVICE]            : 'Criar servicio'
    , [STATE_EDIT_SERVICE]           : 'Modificar servicio'
    , [STATE_NEW_SERVICE_CONTRACT]   : 'Send service provisioning request'
    , [STATE_EDIT_SERVICE_CONTRACT]  : 'Modify contract'
    , [STATE_LIST_SERVICE_CONTRACTS] : 'List customers'
  },
  [CONTRACTED_SERVICES]            :{
    [STATE_LIST_SERVICES]            : 'Serviços contratados',
    [STATE_VIEW_SERVICE_CONTRACT]    : 'Service contract details'
  },
}


class Services extends Component {
  constructor(props) {
    super(props);
    const props_provider = (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : null;
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
      pathname_:          props.location.pathname.split('/').pop(),

      services_states:    null,

      provider:           props_provider || props.actualAccountProfile,
      services:           [],
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      cursor:             '',      
      active_view:        STATE_LIST_SERVICES,
      active_view_object: null,


    };

    this.loadServices                 = this.loadServices.bind(this);  
    this.loadServicesStates           = this.loadServicesStates.bind(this);  
    this.openNotificationWithIcon     = this.openNotificationWithIcon.bind(this); 
    this.onContractListCallback       = this.onContractListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
    this.onNewService                 = this.onNewService.bind(this); 
    this.serviceFormCallback          = this.serviceFormCallback.bind(this);
    this.serviceContractFormCallback  = this.serviceContractFormCallback.bind(this);
    this.renderFooter                 = this.renderFooter.bind(this); 
    this.onNewData                    = this.onNewData.bind(this); 

  }

  getColumns(){
    return columns_helper.columnsForContractedServices(this.onContractListCallback, this.state.services_states);
  }
  
  componentDidMount = async () => {

    const { location } = this.props;
    if(location && location.state)
    {
      this.setState({
          provider: location.state.provider || this.props.actualAccountProfile
      }, async () => {
          const _x_dummy = await this.loadServicesStates();
          const _y_dummy = await this.loadServices();  
      });
    }
    else
    {
      const x_dummy = await this.loadServicesStates();
      const y_dummy = await this.loadServices();  
    }
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    const {provider} = this.props;
    if(prevProps.provider !== provider) {
      this.setState({ provider:provider || this.props.actualAccountProfile});
    }
  }

  onNewService = () => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_SERVICE})
  }

  
  onDisableService = (service) => {
    // const that           = this;
    // Modal.confirm({
    //   title: 'Confirm disable member.',
    //   content: (<p>You are about to disable <b>{service.title}</b>. Continue or cancel.</p>),
    //   onOk() {
        
    //     const account_name   = that.props.actualAccountName;
    //     that.setState({pushingTx:true})
    //     api.bank.createOrUpdateService(service._id, account_name, undefined, undefined, undefined, )
    //       .then((res)=>{
    //         that.openNotificationWithIcon("success", "Member removed from team successfully!")    
    //         that.loadTeam();
    //         that.resetPage(STATE_LIST_SERVICES);
    //       }, (err)=>{
    //         console.log(' >> createOrUpdateTeam >> ', JSON.stringify(err));
    //         that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
    //         that.setState({pushingTx:false});
    //       })
     
    //   },
    //   onCancel() {
        
    //   },
    // });

  }

  onContractListCallback(contract, event){
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
        // this.openNotificationWithIcon("warning", "Not implemented yet");    
        // this.onDisableService(service);
        break;
      case events.CHILDREN:
        // this.setState({active_view: STATE_LIST_SERVICE_CONTRACTS, active_view_object:service})
        this.props.setLastRootMenuFullpath(this.props.location.pathname);
        // this.props.history.push({
        //   pathname: `/common/service-contracts`
        //   , state: { 
        //       referrer: this.props.location.pathname
        //       , provider: service.created_by
        //       , service:  service            
        //     }
        // });
        this.props.history.push({
          pathname: `/common/service-contract-payments`
          , state: { 
              referrer: this.props.location.pathname
              , contract: contract
              , service:  contract.service            
            }
        });
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
      this.setState({active_view:STATE_LIST_SERVICES});
      return;
    }

    if(error)
    {
      return;
    }

    console.log(values)
    
    
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

    const byCustServ = await eos_table_getter.papByCustomerService(customer_account_name, service_id_num);
    console.log('byCustServ', byCustServ)

    if(byCustServ && byCustServ.rows.length>0)
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
        that.setState({pushingTx:true});
        api.bank.sendServiceRequest(provider, customer, service, begins_at, expires_at)
          .then((res)=>{
            console.log(' >> doDeposit >> ', JSON.stringify(res));
            that.setState({pushingTx:false, result:'ok'})
            that.openNotificationWithIcon("success", 'Service provisioning requested successfully');

            setTimeout(()=>that.setState({active_view:STATE_LIST_SERVICES}),1000);
            

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

  serviceFormCallback = async (error, cancel, values) => {
    
    if(cancel)
    {
      this.setState({active_view:STATE_LIST_SERVICES});
      return;
    }

    if(error)
    {
      return;
    }

    console.log(values)
    // return;

    const that           = this;
    const account_name   = this.props.actualAccountName;
    this.setState({pushingTx:true})
    
    api.bank.createOrUpdateService((values._id || undefined), account_name, values.title, values.description, values.input_amount.value, undefined)
      .then((res)=>{
        that.openNotificationWithIcon("success", "Service saved successfully!")    
        that.reloadServices();
        that.resetPage(STATE_LIST_SERVICES);
      }, (err)=>{
        console.log(' >> createOrUpdateService >> ', JSON.stringify(err));
        that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
        that.setState({pushingTx:false});
      })
 

  }

  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
      });    
  }

  loadServicesStates = async () => {
    this.setState({loading:true});

    let data = null;

    try {
      data = await api.bank.getServicesStates();
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Services States", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    }
    this.setState({ services_states: data.services_states, loading:false})
  }

  reloadServices = async () => {

    
    // const provider_account_name = 'organicvegan';
    // const service_id_num        = 2; 
    // const customer_account_name = 'tutinopablo1';
    // console.log(' --------------------- ')
    // console.log('papByProvServSimple:')
    // const papByProvServSimple = await eos_table_getter.papByUInt128(provider_account_name, service_id_num, eos_table_getter.INDEX_POSITION_PAP_BY_PROVIDER_SERVICE, 1);
    // console.log(' >> res:', papByProvServSimple)

    this.setState({
        can_get_more:  true, 
        services:      [],
      }, async () => {
        const dummy_1 = await this.loadServicesStates();
        const dummy_2 = await this.loadServices();
      });  
  }

  loadServices = async () => {

    const {page, provider, can_get_more, cursor} = this.state;

    if(!can_get_more)
    {
      this.openNotificationWithIcon("info", "Nope!");
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let request_page   = 0;
    const limit        = 100;
    let that           = this;
    const account_name = this.props.actualAccountName;
    let contracts = []
    
    try{
      contracts = await eos_table_getter.listPapByCustomer(account_name, undefined, cursor)
    }catch(e){
      this.openNotificationWithIcon("error", "An error occurred while fetching your contracts.", JSON.stringify(e));
      console.log(e)
      return;
    }

    const counter_ids = contracts.rows.map(contract=>contract.service_id)
    const services    = await  api.bank.getServices(request_page, limit, {counter_ids:counter_ids})
    
    const _services  = _.reduce(services, function(result, value, key) {
      result[value.serviceCounterId] = value;
      return result;
    }, {});

    const data = contracts.rows.map(contract => {return{...contract, service:_services[contract.service_id] }})
        

    // console.log('services:', services)
    // console.log('contracts:', contracts)
    // console.log('data:', data)
    that.onNewData({services:data, more:data.more, cursor:data.next_key});

    
  }

  onNewData(data){
    
    const {services, more, cursor} = data;
    const _services       = [...this.state.services, ...services];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _services.length;
    pagination.total      = _services.length;

    const has_received_new_data = (services && services.length>0);

    this.setState({
                  pagination:pagination
                  , services:_services
                  , can_get_more:more
                  , loading:false
                  , cursor:cursor})

    if(!has_received_new_data && _services && _services.length>0)
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
    const {routes, loading, active_view, pathname_} = this.state;
    
    console.log('pathname_', pathname_)
    const title                          = titles[pathname_][active_view] || titles[pathname_][STATE_LIST_SERVICES];

    const buttons = (active_view==STATE_LIST_SERVICES)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServices()} ></Button>]
        :[];
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title={title}

        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {provider, loading, active_view, active_view_object, services_states } = this.state;

    if(active_view==STATE_NEW_SERVICE_CONTRACT)
    {
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <ServiceContractForm key="edit_service_form" 
                  callback={this.serviceContractFormCallback} 
                  services_states={services_states} 
                  service={active_view_object}
                  provider={provider} />    
              </Spin>
            </section>
          </div>      
        </div>);
    }

    if(active_view==STATE_EDIT_SERVICE)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <ServiceForm 
                  key="edit_service_form" 
                  callback={this.serviceFormCallback} 
                  services_states={services_states} 
                  service={active_view_object}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }

    if(active_view==STATE_NEW_SERVICE)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <ServiceForm key="add_service_form" callback={this.serviceFormCallback} services_states={services_states}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }


    //if(active_view==STATE_LIST_SERVICES)  
    const {services} = this.state;
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
                key="table_services" 
                rowKey={record => record.id} 
                loading={this.state.loading} 
                columns={this.getColumns()} 
                dataSource={services} 
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
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadServices()}>More!!</Button> </>)
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
)(Services))
);