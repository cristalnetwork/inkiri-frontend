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

import * as form_helper from '@app/components/Form/form_helper';
import * as columns_helper from '@app/components/TransactionTable/columns';

import { Card, PageHeader, Button} from 'antd';
import { Modal, Table, Spin } from 'antd';

import ServiceForm from '@app/components/Form/service';
import ServiceContractForm from '@app/components/Form/service_contract';

import _ from 'lodash';

import * as eos_table_getter from '@app/services/inkiriApi/eostable-getters';

import * as gqlService from '@app/services/inkiriApi/graphql'
import * as gqlRequestI18nService from '@app/services/inkiriApi/requests-i18n-graphql-helper'

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const STATE_LIST_SERVICES          = 'state_list_services';
const STATE_VIEW_SERVICE_CONTRACT  = 'state_view_service_contract';
const titles = {
  [STATE_LIST_SERVICES]            : 'pages.common.contracted-services.list_services',
  [STATE_VIEW_SERVICE_CONTRACT]    : 'pages.common.contracted-services.view_service_contract'
  
}


class Services extends Component {
  constructor(props) {
    super(props);
    const props_provider = (props && props.location && props.location.state && props.location.state.provider)? props.location.state.provider : null;
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
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
    this.onContractListCallback       = this.onContractListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
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

  onContractListCallback(contract, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        break;
      case events.REMOVE:
        break;
      case events.EDIT:
        break;
      case events.DISABLE:
        break;
      case events.CHILDREN:
        this.onViewServiceContractPayments(contract)
        break;
      case events.NEW_CHILD:
        break;
    }
    return;

  }

  onViewServiceContractPayments = (contract) =>{
    if(!contract.service)
    {
      const title   = this.props.intl.formatMessage({id:'pages.common.contracted-services.error_service_not_exists'})
      const message = this.props.intl.formatMessage({id:'pages.common.contracted-services.error_service_not_exists_message'})
      components_helper.notif.errorNotification(title, message);    
      return;
    }
    this.props.setLastRootMenuFullpath(this.props.location.pathname);
    this.props.history.push({
      pathname: `/common/service-contract-payments`
      , state: { 
          referrer: this.props.location.pathname
          , contract: contract
          , service:  contract.service            
        }
    });
  }
  loadServicesStates = async () => {
    this.setState({loading:true});

    let data = null;

    try {
      data = await api.bank.getServicesStates();
    } catch (e) {
      const title = this.props.intl.formatMessage({id:'pages.common.contracted-services.error.retrieving_state'})          
      components_helper.notif.exceptionNotification( title, e);    
      this.setState({ loading:false})
      return;
    }
    this.setState({ services_states: data.services_states, loading:false})
  }

  reloadServices = async () => {
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
      const title = this.props.intl.formatMessage({id:'pages.common.contracted-services.end_of_list'})   
      components_helper.notif.infoNotification( title);    
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let request_page   = 0;
    const limit        = 100;
    let that           = this;
    const account_name = this.props.actualAccountName;
    let contracts = []

    // const filter_obj = {limit, page, ...(filter||{})};
    // console.log(' ---- TransactionTable filter_obj:', filter_obj);
    // try{
    //   // const data = await gqlService.requests(filter_obj);
    //   const data = await gqlRequestI18nService.extrato(filter_obj, this.props.intl);
    //   that.onNewData(data);
    // }
    // catch(e)
    // {
    //   this.setState({loading:false});
    //   components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_loading'}), e);
    //   return;
    // }

    try{
      contracts = await eos_table_getter.listPapByCustomer(account_name, undefined, cursor)
    }catch(e){
      const title = this.props.intl.formatMessage({id:'pages.common.contracted-services.error.while_fetching_services'})          
      components_helper.notif.exceptionNotification(title, e);
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

      const title = this.props.intl.formatMessage({id:'pages.common.contracted-services.end_of_list'})          
      components_helper.notif.infoNotification(title)
    }
  }


  // Component Events
  
  render() {
    const content                        = this.renderContent();
    const {routes, loading, active_view } = this.state;
    
    const title = this.props.intl.formatMessage({id:titles[active_view]})          

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
                scroll={{ x: 820 }}
                />
          </div>
        </Card>
      )
  }
  //
  renderFooter = () => {
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadServices()}>
              <InjectMessage id="pages.common.contracted-services.load_more_services" />
            </Button>);
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
)(injectIntl(Services)))
);