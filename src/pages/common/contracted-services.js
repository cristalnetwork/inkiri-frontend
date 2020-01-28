import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as apiRedux from '@app/redux/models/api';
import * as graphqlRedux from '@app/redux/models/graphql'

import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as form_helper from '@app/components/Form/form_helper';
import * as columns_helper from '@app/components/TransactionTable/columns';
import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';


import RequestsFilter from '@app/components/Filters/requests';

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
    const default_filter = {'state':`${globalCfg.api.STATE_REQUESTED},${globalCfg.api.STATE_ACCEPTED}`};
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      
      services_states:    props.serviceStates,

      provider:           props_provider || props.actualAccountProfile,
      services:           [],
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      cursor:             '',      
      active_view:        STATE_LIST_SERVICES,
      active_view_object: null,
      intl:               {},
      default_filter:     default_filter,
      filter:             default_filter,
    };

    this.loadServices                 = this.loadServices.bind(this);  
    // this.loadServicesStates           = this.loadServicesStates.bind(this);  
    this.onContractListCallback       = this.onContractListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
    this.renderFooter                 = this.renderFooter.bind(this); 
    this.onNewData                    = this.onNewData.bind(this); 

    this.timeout_id = null;
  }

  getColumns(){
    // return columns_helper.columnsForContractedServices(this.columnsForContractedServiceRequestonContractListCallback, this.state.services_states);
    return columns_helper.columnsForContractedServiceRequest(this.onContractListCallback);
  }
  
  componentDidMount = async () => {

    const {formatMessage}  =this.props.intl;
    const error_service_price_mismatch = formatMessage( { id:'pages.common.request-details.error_service_price_mismatch'});
    const confirm_accept_service = formatMessage( { id:'pages.common.request-details.confirm_accept_service'});
    const confirm_accept_service_message = formatMessage( { id:'pages.common.request-details.confirm_accept_service_message'});
    const reject_service_request = formatMessage( { id:'pages.common.request-details.reject_service_request'});
    const reject_service_request_message = formatMessage( { id:'pages.common.request-details.reject_service_request_message'});
    this.setState({intl:{ error_service_price_mismatch, confirm_accept_service, confirm_accept_service_message, reject_service_request, reject_service_request_message }});


    if(utils.arrayNullOrEmpty(this.state.services_states))
      this.props.loadConfig();

    const { location } = this.props;
    if(location && location.state)
    {
      this.setState({
          provider: location.state.provider || this.props.actualAccountProfile
      }, async () => {
          const _y_dummy = await this.loadServices();  
      });
    }
    else
    {
      const y_dummy = await this.loadServices();  
    }
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    const {provider} = this.props;
    if(prevProps.provider !== provider) {
      this.setState({ provider:provider || this.props.actualAccountProfile});
    }

    let new_state = {};
    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    const errors_changed = !utils.arraysEqual(prevProps.getErrors, this.props.getErrors);
    if(errors_changed ){
      const that = this;
      setTimeout(()=> that.reloadServices() ,100);
    }
    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      
      const lastResult = this.props.getLastResult;
      if(lastResult)
      {
        const that = this;
        setTimeout(()=> that.reloadServices() ,100);
      }
    }

    if(Object.keys(new_state).length>0)      
        this.setState(new_state);
  }

  acceptServiceRequest = async (request) =>{

    const {_id, amount, service, service_extra, requested_by, requested_to, requestCounterId} = request;
    const private_key    = this.props.actualPrivateKey;
    const provider       = requested_by.account_name;
    const customer       = requested_to.account_name;
    const sender         = globalCfg.currency.issuer; //this.props.actualAccountName;
    const auth_account   = this.props.actualAccountName;
    const begins_at      = api.pap_helper.getServiceBeginTimestamp(service_extra.begins_at)
    const periods        = api.pap_helper.getServicePeriods(service_extra)

    if(amount!=service.amount)
    {
      const error_service_price_mismatch_message = this.props.intl.formatMessage( { id:'pages.common.request-details.error_service_price_mismatch_message'}, {amount:amount, service_amount:service.amount});
      components_helper.notif.warningNotification(this.state.intl.error_service_price_mismatch, error_service_price_mismatch_message);
      return;
    } 
    
    const that = this;
    
    Modal.confirm({
      title:   this.state.intl.confirm_accept_service, 
      content: this.state.intl.confirm_accept_service_message,
      onOk() {
          
        //ToDo
        const steps= [
          {
            _function:           'acceptService'
            , _params:           [auth_account, private_key, customer, provider, service.serviceCounterId, service.amount, begins_at, periods, requestCounterId]
          }, 
          {
            _function:           'bank.acceptServiceRequest'
            , _params:           [auth_account, _id, api.bank.REQUEST_RECEIVER] 
            , last_result_param: [{field_name:'transaction_id', result_idx_diff:-1}]
          },
        ]
        that.props.callAPIEx(steps)
        
      },
      onCancel() {
        // that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
        
  }

  rejectServiceRequest(request){
    const that       = this;
    
    Modal.confirm({
      title:   this.state.intl.reject_service_request,
      content: this.state.intl.reject_service_request_message,
      onOk() {
        const sender     = that.props.actualAccountName;
        const step ={
                _function:   'bank.rejectService'
                , _params:   [sender, api.bank.REQUEST_RECEIVER, request._id]
              }
        
        that.props.callAPI(step._function, step._params)
      },
      onCancel() {
        // that.setState({pushingTx:false})
        console.log('Cancel');
      },
    });  
    
  }
  onContractListCallback(contract, event){
    const {events} = columns_helper;
    switch(event){
      case events.ACCEPT_SERVICE:
        this.acceptServiceRequest(contract);
        break;
      case events.REJECT_SERVICE:
        this.rejectServiceRequest(contract);
        break;
      case events.CHILDREN:
        this.onViewServiceContractPayments(contract)
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
  
  // loadServicesStates = async () => {
  //   this.setState({loading:true});

  //   let data = null;

  //   try {
  //     data = await api.bank.getServicesStates();
  //   } catch (e) {
  //     const title = this.props.intl.formatMessage({id:'pages.common.contracted-services.error.retrieving_state'})          
  //     components_helper.notif.exceptionNotification( title, e);    
  //     this.setState({ loading:false})
  //     return;
  //   }
  //   this.setState({ services_states: data.services_states, loading:false})
  // }

  reloadServices = async () => {
    this.setState({
        can_get_more:  true, 
        services:      [],
        filter:        this.state.default_filter
      }, async () => {
        // const dummy_1 = await this.loadServicesStates();
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
    const {filter} = this.state;
    const filter_obj = { ...filter
                         , limit :           limit
                         , page :          request_page
                         , to :            this.props.actualAccountName
                         , requested_type: globalCfg.api.TYPE_SERVICE};
    
    try{
      // const data = await gqlService.requests(filter_obj);
      const data = await gqlRequestI18nService.requests(filter_obj, this.props.intl);
      this.onNewData({services:data, more:false, cursor:null});
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_loading'}), e);
      return;
    }

    
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


  requestFilterCallback = (error, cancel, values, refresh) => {
    
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
        this.reloadServices();
      } ,100);
      return;
    }
    
    if(values!==undefined)
    {
      clearTimeout(this.timeout_id);
      this.timeout_id = setTimeout(()=> {
        this.setState({filter:values}, ()=> this.reloadServices() );
        
      } ,100);
    }
  }


  // Component Events
  
  render() {
    const {routes, loading, active_view } = this.state;
    const content = this.renderContent();
    const title   = this.props.intl.formatMessage({id:titles[active_view]})          

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
    const {provider, loading, active_view, active_view_object, services_states, isFetching } = this.state;
    
    //if(active_view==STATE_LIST_SERVICES)  
    const {services} = this.state;
    return (
      <Card
          key="card_table_all_requests"
          className="styles listCard vertical_align_top"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
            <RequestsFilter 
              callback={this.requestFilterCallback} 
              request_type={globalCfg.api.TYPE_SERVICE}
              hidden_fields={['from', 'to', 'requested_type', 'date_range']}
              />

            <ResizeableTable
                key="table_services" 
                rowKey={record => record.id} 
                loading={loading||isFetching} 
                columns_def={this.getColumns()} 
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
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        
        serviceStates:       graphqlRedux.serviceStates(state),

        isFetching:       apiRedux.isFetching(state),
        getErrors:        apiRedux.getErrors(state),
        getLastError:     apiRedux.getLastError(state),
        getResults:       apiRedux.getResults(state),
        getLastResult:    apiRedux.getLastResult(state),
    }),
    (dispatch)=>({
        callAPI:          bindActionCreators(apiRedux.callAPI, dispatch),
        callAPIEx:        bindActionCreators(apiRedux.callAPIEx, dispatch),

        loadConfig:         bindActionCreators(graphqlRedux.loadConfig, dispatch),

        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Services)))
);