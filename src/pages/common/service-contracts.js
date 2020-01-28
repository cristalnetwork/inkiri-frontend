import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';
import InjectMessage from "@app/components/intl-messages";

import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Dropdown, Icon, Menu } from 'antd';
import { Card, PageHeader, Tabs, Button,  Modal, Table, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ServiceContractChargeForm from '@app/components/Form/service_contract_charge';

import * as eos_table_getter from '@app/services/inkiriApi/eostable-getters';

import { injectIntl } from "react-intl";

const STATE_LIST_CONTRACTS         = 'state_list_contracts';
const STATE_NEW_CHARGE             = 'state_new_charge';

const titles = {
  [STATE_LIST_CONTRACTS]           : 'title_service_contracts'
  , [STATE_NEW_CHARGE]             : 'title_charge'
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

      intl:               {}
    };

    this.loadServiceContracts         = this.loadServiceContracts.bind(this);  
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

    const {formatMessage} = this.props.intl;
    const end_if_list_reached = formatMessage({id:'pages.common.service_contracts.end_if_list_reached'});
    const title_service_contracts = formatMessage({id:'pages.common.service_contracts.title_service_contracts'});
    const title_charge = formatMessage({id:'pages.common.service_contracts.title_charge'});
    const error_customer_has_no_balance = formatMessage({id:'pages.common.service_contracts.error_customer_has_no_balance'});
    const error_customer_not_enough_balance = formatMessage({id:'pages.common.service_contracts.error_customer_not_enough_balance'});
    const success_charged_successfully = formatMessage({id:'pages.common.service_contracts.success_charged_successfully'});
    const error_unexpected_occurred = formatMessage({id:'pages.common.service_contracts.error_unexpected_occurred'});
    const error_occurred_fetching_contracts = formatMessage({id:'pages.common.service_contracts.error_occurred_fetching_contracts'});
    const info_end_of_service_list = formatMessage({id:'pages.common.service_contracts.info_end_of_service_list'});
    const pushing_transaction = formatMessage({id:'pages.common.service_contracts.pushing_transaction'});
    const load_more_contracts = formatMessage({id:'pages.common.service_contracts.load_more_contracts'});
    const stat_title_service = formatMessage({id:'pages.common.service_contracts.stat_title_service'});
    const stat_title_desc = formatMessage({id:'pages.common.service_contracts.stat_title_desc'});
    const stat_title_price = formatMessage({id:'pages.common.service_contracts.stat_title_price'});
    const stat_title_state = formatMessage({id:'pages.common.service_contracts.stat_title_state'});

    this.setState({intl:{load_more_contracts, stat_title_service, stat_title_desc, stat_title_price, stat_title_state, end_if_list_reached, title_service_contracts, title_charge, error_customer_has_no_balance, error_customer_not_enough_balance, success_charged_successfully, error_unexpected_occurred, error_occurred_fetching_contracts, info_end_of_service_list, pushing_transaction}})

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
    
    // this.setState({active_view:STATE_NEW_SERVICE})
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
        break;
      case events.CHARGE:
        this.setState({active_view: STATE_NEW_CHARGE, active_view_object:contract})
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
      components_helper.notif.errorNotification(this.state.intl.error_customer_has_no_balance);
      that.setState({pushingTx:false});
      return;
    }

    if(globalCfg.currency.toNumber(customer_balance.data.balance)<=globalCfg.currency.toNumber(contract.price))
    {
        that.setState({pushingTx:false});
        components_helper.notif.errorNotification(this.state.intl.error_customer_not_enough_balance);
        console.log(customer_balance);
        return;
    }

    console.log(sender, private_key, account, provider, service_id, period_to_charge);

    api.chargeService(sender, private_key, account, provider, service_id, contract.price, period_to_charge)
      .then((res)=>{
        console.log(' >> doCharge >> ', JSON.stringify(res));
        that.setState({pushingTx:false})
        components_helper.notif.successNotification(this.state.intl.success_charged_successfully);
        setTimeout(()=> {
          that.setState({active_view:STATE_LIST_CONTRACTS});
          that.props.loadBalance(that.props.actualAccountName);
        },250);
        

      }, (err)=>{
        components_helper.notif.exceptionNotification(this.state.intl.error_unexpected_occurred, err);
        console.log(JSON.stringify(err));
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
    //   this.setState({loading:false});
    //   return;
    // }

    this.setState({loading:true});

    let contracts = null;

    try{
      contracts = await eos_table_getter.papByProviderService(provider.account_name, parseInt(service.serviceCounterId), 0);
    }catch(e){
      components_helper.notif.exceptionNotification(this.state.intl.error_occurred_fetching_contracts, e);
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
      components_helper.notif.infoNotification(this.state.intl.info_end_of_service_list);
      return;
    }
    // else
    //   this.computeStats();
  }


  // Component Events
  
  render() {
    const content                 = this.renderContent();
    const service_info            = this.renderServiceInfo();
    const {loading, active_view, intl}  = this.state;
    const title                   = intl[titles[active_view]]; //titles[active_view] || titles[STATE_LIST_CONTRACTS];
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
    const {intl} = this.state;
  
    const items = [
        stats_helper.buildItemSimple(intl.stat_title_service, title)
        , stats_helper.buildItemSimple(intl.stat_title_desc, description)
        , stats_helper.buildItemMoney(intl.stat_title_price, amount)
        , stats_helper.buildItemSimple(intl.stat_title_state, state)
      ]
    return (<div style={{ background: '#fff', padding: 8, marginTop: 24}}>
        <TableStats stats_array={items} visible={true} can_close={false}/>
      </div>)
  }
  //
  bulkChargeClick = (e) => {
    if(typeof e === 'object' && typeof e.preventDefault === 'function')
      e.preventDefault();
    console.log('--------');
    console.log('click: ', e);
    console.log('props: ', e.item.props)
    // this.downloadTxtFile(e.item.props.href);
  }

  getBulkActions  = () => {
    const menu = (
      <Menu onClick={this.bulkChargeClick}>
        <Menu.Item action="bulk-charge" >
          <FontAwesomeIcon icon="file-invoice-dollar" size="lg" color="black"/> &nbsp;<InjectMessage id="pages.common.service_contracts.bulk_action_bulk_charge" />
        </Menu.Item> 
        
      </Menu>
    );
    //
    return (<Dropdown overlay={menu}>
          <Button style={{marginLeft:8}}>
            <InjectMessage id="pages.common.service_contracts.bulk_action_title" />&nbsp;<Icon type="down" />
          </Button>
        </Dropdown>);
  }
  //
  renderContent(){
    const {provider, service, loading, active_view, active_view_object } = this.state;

    if(active_view==STATE_NEW_CHARGE)
    {
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip={this.state.intl.pushing_transaction}>
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
    const bulkActions = this.getBulkActions();
    return (
      <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          bodyStyle={{padding: 8}}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          <div style={{ background: '#fff', minHeight: 360, marginTop: 0}}>
            <Table
                title={() => bulkActions}
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
    return (<Button key="load-more-data" disabled={!this.state.cursor} onClick={()=>this.loadServiceContracts(false)}>
              {this.state.intl.load_more_contracts}
            </Button>)
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
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch),
        loadBalance:             bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(injectIntl(ServiceContracts)))
);