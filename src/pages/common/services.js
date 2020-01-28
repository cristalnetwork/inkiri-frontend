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

import ServiceForm from '@app/components/Form/service';
import ServiceContractForm from '@app/components/Form/service_contract';

import * as eos_table_getter from '@app/services/inkiriApi/eostable-getters';
import * as gqlService from '@app/services/inkiriApi/graphql'

import { injectIntl } from "react-intl";

const STATE_LIST_SERVICES          = 'state_list_services';
const STATE_NEW_SERVICE            = 'state_new_service';
const STATE_EDIT_SERVICE           = 'state_edit_service';
const STATE_NEW_SERVICE_CONTRACT   = 'state_new_service_contract';
const STATE_EDIT_SERVICE_CONTRACT  = 'state_edit_service_contract';
const STATE_LIST_SERVICE_CONTRACTS = 'state_list_service_contracts';
const STATE_LIST_SERVICE_REQUESTS  = 'state_list_service_requests';

const titles = {
  [STATE_LIST_SERVICES]            : 'title_list_services' //'pages.common.services.title_list_services'
  , [STATE_NEW_SERVICE]            : 'title_new_service' //'pages.common.services.title_new_service'
  , [STATE_EDIT_SERVICE]           : 'title_edit_service' //'pages.common.services.title_edit_service'
  , [STATE_NEW_SERVICE_CONTRACT]   : 'title_new_service_contract' //'pages.common.services.title_new_service_contract'
  , [STATE_EDIT_SERVICE_CONTRACT]  : 'title_edit_service_contract' //'pages.common.services.title_edit_service_contract'
  , [STATE_LIST_SERVICE_CONTRACTS] : 'title_list_service_contracts' //'pages.common.services.title_list_service_contracts'
  , [STATE_LIST_SERVICE_REQUESTS]  : 'title_list_service_requests' //'pages.common.services.title_list_service_contracts'
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
      
      active_view:        STATE_LIST_SERVICES,
      active_view_object: null,

      intl:               {}

    };

    this.loadServices                 = this.loadServices.bind(this);  
    this.loadServicesStates           = this.loadServicesStates.bind(this);      
    this.onServicesListCallback       = this.onServicesListCallback.bind(this);
    this.getColumns                   = this.getColumns.bind(this);
    this.onNewService                 = this.onNewService.bind(this); 
    this.serviceFormCallback          = this.serviceFormCallback.bind(this);
    this.serviceContractFormCallback  = this.serviceContractFormCallback.bind(this);
    this.renderFooter                 = this.renderFooter.bind(this); 
    this.onNewData                    = this.onNewData.bind(this); 

  }

  getColumns(){
    return columns_helper.columnsForServices(this.onServicesListCallback, this.state.services_states);
  }
  
  componentDidMount = async () => {

    const {formatMessage} = this.props.intl;
    
    const title_list_services = formatMessage({id:'pages.common.services.title_list_services'});
    const title_new_service = formatMessage({id:'pages.common.services.title_new_service'});
    const title_edit_service = formatMessage({id:'pages.common.services.title_edit_service'});
    const title_new_service_contract = formatMessage({id:'pages.common.services.title_new_service_contract'});
    const title_edit_service_contract = formatMessage({id:'pages.common.services.title_edit_service_contract'});
    const title_list_service_contracts = formatMessage({id:'pages.common.services.title_list_service_contracts'});
    const title_list_service_requests = formatMessage({id:'pages.common.services.title_list_service_requests'});
    const error_duplicated = formatMessage({id:'pages.common.services.error_duplicated'});
    const error_duplicated_message = formatMessage({id:'pages.common.services.error_duplicated_message'});
    const confirm_send_request = formatMessage({id:'pages.common.services.confirm_send_request'});
    const error_retrieving_state = formatMessage({id:'pages.common.services.error_retrieving_state'});
    const end_of_services_list = formatMessage({id:'pages.common.services.end_of_services_list'});
    const error_retrieving_services = formatMessage({id:'pages.common.services.error_retrieving_services'});
    const new_service_action_text = formatMessage({id:'pages.common.services.new_service_action_text'});
    const pushing_transaction = formatMessage({id:'pages.common.services.pushing_transaction'});
    const load_more_services = formatMessage({id:'pages.common.services.load_more_services'});

    this.setState({intl:{title_list_service_requests, title_list_services, title_new_service, title_edit_service, title_new_service_contract, title_edit_service_contract, title_list_service_contracts, error_duplicated, error_duplicated_message, confirm_send_request, error_retrieving_state, end_of_services_list, error_retrieving_services, new_service_action_text, pushing_transaction, load_more_services}});



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

    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const that          = this;
      const {active_view} = this.state;
      
      if(active_view==STATE_NEW_SERVICE_CONTRACT)
        setTimeout(()=> {
          that.reloadServices();
          that.resetPage(STATE_LIST_SERVICES);
        },250);
        // setTimeout(()=>that.setState({active_view:STATE_LIST_SERVICES}),250);
      if(active_view==STATE_EDIT_SERVICE || active_view==STATE_NEW_SERVICE)
        setTimeout(()=> {
          that.reloadServices();
          that.resetPage(STATE_LIST_SERVICES);
        },250);
      

    }
    
  }

  onNewService = () => {
    
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

  onServicesListCallback(service, event){
    const {events} = columns_helper;
    switch(event){
      case events.VIEW:
        break;
      case events.REMOVE:
        break;
      case events.EDIT:
        // console.log(event)
        this.setState({active_view: STATE_EDIT_SERVICE, active_view_object:service})
        break;
      case events.DISABLE:
        this.onDisableService(service);
        break;
      case events.REQUESTS:
        this.props.setLastRootMenuFullpath(this.props.location.pathname);
        this.props.history.push({
          pathname: `/common/service-requests`
          , state: { 
              referrer: this.props.location.pathname
              , provider: service.created_by
              , service:  service            
            }
        });
        break;
      case events.CHILDREN:
        this.props.setLastRootMenuFullpath(this.props.location.pathname);
        this.props.history.push({
          pathname: `/common/service-contracts`
          , state: { 
              referrer: this.props.location.pathname
              , provider: service.created_by
              , service:  service            
            }
        });
        break;
      case events.NEW_CHILD:
        this.setState({active_view: STATE_NEW_SERVICE_CONTRACT, active_view_object:service})
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
    
    const that                                       = this;
    const {customer, begins_at, expires_at, periods} = values;
    const sender                                     = that.props.actualAccountName;
    const {provider, active_view_object}             = this.state;
    const service                                    = active_view_object;
    // 1 check if service is already been provisioned to customer:
    const customer_account_name = customer;
    const service_id_num        = service.serviceCounterId;
    const byCustServ = await eos_table_getter.papByCustomerService(customer_account_name, service_id_num, 0);
    
    if(byCustServ && byCustServ.rows.length>0)
    {
      components_helper.notif.errorNotification(this.state.intl.error_duplicated, this.state.intl.error_duplicated_message);
      return;
    }

    const confirm_send_request_message = this.props.intl.formatMessage({id:'pages.common.services.confirm_send_request_message'}
        , {  customer     : customer
              , service   : service.title
              , amount    : globalCfg.currency.toCurrencyString(service.amount)
              , periods   : periods
              , begins_at : begins_at.format(form_helper.MONTH_FORMAT)
              , bold: (str) => <b key={Math.random()}>{str}</b>});
    //
    Modal.confirm({
      title: this.state.intl.confirm_send_request,
      content: (<p>{confirm_send_request_message}</p>),
      onOk() {
        //
        const _function = 'bank.sendServiceRequest';
        that.props.callAPI(_function, [provider, customer, service, begins_at, expires_at])

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
    
    const _function = 'bank.createOrUpdateService';
    that.props.callAPI(_function, [(values._id || undefined), account_name, values.title, values.description, values.input_amount.value])
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
      components_helper.notif.exceptionNotification(this.state.intl.error_retrieving_state, e);
      this.setState({ loading:false})
      return;
    }
    this.setState({ services_states: data.services_states, loading:false})
  }

  reloadServices = async () => {

    this.setState({
        page:        -1, 
        services:    [],
      }, async () => {
        const dummy_1 = await this.loadServicesStates();
        const dummy_2 = await this.loadServices();
      });  
  }

  loadServices = async () => {

    const {page, provider, can_get_more} = this.state;

    if(!can_get_more && page>=0)
    {
      components_helper.notif.infoNotification(this.state.intl.end_of_services_list);
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let request_page   = (page<0)?0:(page+1);
    const limit        = this.state.limit;
    let that           = this;
    
    let services = [];

    try {
      services = await gqlService.servicesEx({page:request_page, limit:limit, account_name:this.props.actualAccountName});
      // services = await api.bank.getServices(request_page, limit, {account_name:provider.account_name});
      console.log('services:', services)
    } catch (e) {

      components_helper.notif.exceptionNotification(this.state.intl.error_retrieving_services, e);
      this.setState({ loading:false})
      return;
    } 
    this.onNewData (services||[]) ;

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
      components_helper.notif.infoNotification(this.state.intl.end_of_services_list);
    }
    // else
    //   this.computeStats();
  }


  // Component Events
  
  render() {
    const content                        = this.renderContent();
    const {routes, loading, active_view} = this.state;
    const title                          = this.state.intl[titles[active_view]]; //titles[active_view] || titles[STATE_LIST_SERVICES];

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
                    <Spin spinning={this.state.pushingTx} delay={500} tip={this.state.intl.pushing_transaction}>
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
              <Spin spinning={this.state.pushingTx} delay={500} tip={this.state.intl.pushing_transaction}>
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
              <Spin spinning={this.state.pushingTx} delay={500} tip={this.state.intl.pushing_transaction}>
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
          className="styles listCard vertical_align_top"
          bordered={false}
          style={{ marginTop: 24 }}
          bodyStyle={{padding: 8}}
          headStyle={{display:'none'}}
        >
          <div style={{ background: '#fff', minHeight: 360, marginTop: 0}}>
            <Table
                key="table_services" 
                rowKey={record => record._id} 
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
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadServices()}>
        {this.state.intl.load_more_services}
      </Button> </>)
  }
  

}
//
export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
    

        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state)
    }),
    (dispatch)=>({
        callAPI:     bindActionCreators(apiRedux.callAPI, dispatch),

        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Services)))
);