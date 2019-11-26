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

import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Card, PageHeader, Tag, Tabs, Button, Form, Input, Icon} from 'antd';
import { Modal, notification, Table, Divider, Spin } from 'antd';

import ServiceForm from '@app/components/Form/service';
import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

const routes = routesService.breadcrumbForFile('accounts');

const STATE_LIST_SERVICES = 'state_list_services';
const STATE_NEW_SERVICE   = 'state_new_service';
const STATE_EDIT_SERVICE  = 'state_edit_service';

class Services extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
      services_states:    null,
      services:           [],
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      
      active_view:        STATE_LIST_SERVICES,
      active_view_object: null,


    };

    this.loadServices               = this.loadServices.bind(this);  
    this.loadServicesStates         = this.loadServicesStates.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onServicesListCallback     = this.onServicesListCallback.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewService               = this.onNewService.bind(this); 
    this.serviceFormCallback        = this.serviceFormCallback.bind(this);
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this); 

  }

  getColumns(){
    return columns_helper.columnsForServices(this.onServicesListCallback, this.state.services_states);
  }
  
  componentDidMount = async () => {
    const x_dummy = await this.loadServicesStates();
    const y_dummy = await this.loadServices();  
  } 

  onNewService = () => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_SERVICE})
  }

  onEditService = (service) => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view: STATE_EDIT_SERVICE, active_view_object:service})
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

  onServicesListCallback(service, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        console.log(event)
        break;
      case events.REMOVE:
        break;
      case events.EDIT:
        // console.log(event)
        this.onEditService(service);
        break;
      case events.DISABLE:
        this.onDisableService(service);
        break;
      case events.CHILDREN:

        break;
      case events.NEW_CHILD:
        
        break;
    }
    return;

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

  reloadServices(){
    this.setState({
        page:        -1, 
        services:    [],
      }, () => {
        this.loadServices();
      });  
  }

  loadServices = async () => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.openNotificationWithIcon("info", "Nope!");
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit        = this.state.limit;
    let that           = this;
    
    let services = [];

    console.log('##1')
    try {
      services = await api.bank.getServices(this.props.actualAccountName, page, limit);
      console.log('##2')
    } catch (e) {

      this.openNotificationWithIcon("error", "Error retrieveing Services", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    } 
    // console.log(JSON.stringify(team));
    // this.setState({ team: team, loading:false})
    console.log('##3')
    this.onNewData (services) ;
  }

  onNewData(services){
    
    const _services       = [...this.state.services, ...services];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _services.length;
    pagination.total      = _services.length;

    const has_received_new_data = (services && services.length>0);

    this.setState({
                  pagination:pagination, 
                  services:_services, 
                  can_get_more:(has_received_new_data && services.length==this.state.limit), 
                  loading:false})

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
    const {routes, loading, active_view} = this.state;
    
    const buttons = (active_view==STATE_LIST_SERVICES)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServices()} ></Button>, 
        <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewService()}}> Service</Button>]
        :[];
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title="Serviços oferecidos"
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {loading, active_view, active_view_object, services_states } = this.state;

    
    if(active_view==STATE_EDIT_SERVICE)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <ServiceForm key="edit_service_form" callback={this.serviceFormCallback} services_states={services_states} service={active_view_object}/>    
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
  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadServices()}>More!!</Button> </>)
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
)(Services))
);