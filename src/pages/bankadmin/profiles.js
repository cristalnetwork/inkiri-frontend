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

import { Radio, Select, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col, List } from 'antd';
import { Form, Input, Icon} from 'antd';
import { notification, Table, Divider, Spin } from 'antd';

import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Option } = Select;
const { Search, TextArea } = Input;

const routes = routesService.breadcrumbForFile('accounts');


class Profiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      profiles:       [],
      
      page:           -1, 
      limit:          globalCfg.api.default_page_size,
      can_get_more:   true,
      cursor:         '',
      stats:          undefined,
    };

    this.loadProfiles               = this.loadProfiles.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    // this.onTableChange              = this.onTableChange.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewProfile               = this.onNewProfile.bind(this); 
    this.renderAccountTypeFilter    = this.renderAccountTypeFilter.bind(this);
    this.renderAccountStateFilter   = this.renderAccountStateFilter.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
  }

  getColumns(){
    return columns_helper.columnsForProfiles(this.onButtonClick);
  }
  
  componentDidMount(){
    this.loadProfiles(true);  
  } 

  onNewProfile = () => {
    
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    const pathname = `/${this.props.actualRole}/create-account`
    const button = (<Button 
                          type="link" 
                          onClick={()=>{ 
                            this.props.history.push({
                              pathname: pathname
                            })
                          }} size="small">account creation</Button>);
    //
    this.openNotificationWithIcon("warning", "Notification", (<p>In order to create a profile, please refer to {button}.</p>) );    
    

  }

  onButtonClick(profile){

    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.props.setLastRootMenuFullpath(this.props.location.pathname);
    
    this.props.history.push({
      pathname: `/${this.props.actualRole}/profile`
      , state: { 
          profile:  profile, 
          referrer: this.props.location.pathname
        }
    })

    // this.props.history.push({
    //   pathname: `/${this.props.actualRole}/account`
    //   , state: { 
    //       referrer: this.props.location.pathname,
    //       account:  account
    //     }
    // })

  }

  reloadProfiles(){
    this.setState({
        page:        -1, 
        profiles:    [],
      }, () => {
        this.loadProfiles();
      });  
  }

  loadProfiles = async (first) => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit        = this.state.limit;
    
    let profiles = null;

    try {
      profiles = await api.bank.listProfiles(page, limit, {account_type:'personal'});
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing profiles", JSON.stringify(e));
      return;
    } 
    // console.log(profiles)
    this.onNewData(profiles, first);
      
  }

  onNewData(profiles, first){
    

    const _profiles             = [...this.state.profiles, ...profiles];
    const pagination            = {...this.state.pagination};
    pagination.pageSize         = _profiles.length;
    pagination.total            = _profiles.length;

    const has_received_new_data = (profiles && profiles.length>0);
    const can_get_more          = (has_received_new_data && profiles.length==this.state.limit)

    this.setState({ pagination:pagination
                    , profiles:_profiles
                    , can_get_more:can_get_more
                    , loading:false})

    if(!has_received_new_data && !first)
    {
      this.openNotificationWithIcon("info", "End of profiles","You have reached the end of profiles list!")
    }
    else
      this.computeStats();
  }

  
  computeStats(){
    return;

    // let stats      = this.state.stats;
    // const profiles = this.state.profiles;
    // if(!profiles)
    // {
    //   this.setState({stats:this.getDefaultStats()});
    //   return;
    // }

    // const admin    = accounts.filter( acc => globalCfg.bank.isAdminAccount(acc))
    //                 .reduce((acc, amount) => acc + 1, 0);
    // const business = accounts.filter( acc => globalCfg.bank.isBusinessAccount(acc))
    //                 .reduce((acc, amount) => acc + 1, 0);
    // const personal = accounts.filter( acc => globalCfg.bank.isPersonalAccount(acc))
    //                 .reduce((acc, amount) => acc + 1, 0);
    // const foundation = accounts.filter( acc => globalCfg.bank.isFoundationAccount(acc))
    //                 .reduce((acc, amount) => acc + 1, 0);

    // this.setState({stats:{
    //     total :               accounts?accounts.length:0
    //     , pending:            'N/A' 
    //     , negative_balance:   negative
    //     , admin:              admin
    //     , personal:           personal
    //     , business:           business
    //     , foundation:         foundation
    //     }});

  }

  getDefaultStats(){
    return {
        total:               0
        , pending:           'N/A' 
        , negative_balance:  0
        , admin:             0
        , personal:          0
        , business:          0
        , foundation:        0 };
  }

  currentStats(){
    const x = this.state.stats;
    return x?x:this.getDefaultStats();
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events
  

  
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProfiles()}>More!!</Button>)
  }

  //
  
  renderFilterContent(){
    const optTypes  = this.renderAccountTypeFilter();
    const optStates = this.renderAccountStateFilter();
    return(
      <div className="filter_wrap">
        <Row>
          <Col span={24}>
            <Form layout="inline" className="filter_form" onSubmit={this.handleSubmit}>
              <Form.Item label="Account Type">
                {optTypes}
              </Form.Item>
              <Form.Item label="Account State">
                {optStates}
              </Form.Item>
              <Form.Item  label="Search">
                  <Search className="styles extraContentSearch" placeholder="Search" onSearch={() => ({})} />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" disabled>
                  Filter
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }

  // 
  renderAccountStateFilter(){
    // console.log(' ** renderAccountStateFilter')
    return (
      <Select placeholder="Account status"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">
        {globalCfg.bank.listAccountStates()
          .map( account_state => <Option key={'option'+account_state} value={account_state} label={utils.firsts(account_state)}>{ utils.capitalize(account_state) } </Option> )}
    </Select>
    )
  }
  //
  renderAccountTypeFilter(){
    // console.log(' ** renderAccountTypeFilter')
    return (<Select placeholder="Account type"
                    mode="multiple"
                    style={{ minWidth: '250px' }}
                    defaultValue={['ALL']}
                    optionLabelProp="label">

      {globalCfg.bank.listAccountTypes()
        .map( account_type => 
          <Option key={'option_'+account_type} value={account_type} label={account_type}>{ account_type } </Option> 
        )}
      </Select>);
  }
  
  render() {
    const content               = this.renderContent();
    const stats                 = this.renderTableViewStats();
    const filters               = this.renderFilterContent();
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadProfiles()} ></Button>,
            <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewProfile()}}> Profile</Button>,
          ]}
          title="Profiles"
          subTitle="Bank Profiles Administration"
        >
          
        </PageHeader>
        
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {filters}
          {stats}
          {content}
        </Card>

      </>
    );
  }

  //
  renderTableViewStats(){
    return (null);

    const {total, pending, negative_balance, personal, business, admin, foundation} = this.currentStats();  
    const items = [
        stats_helper.buildItemSimple('TOTAL', total)
        , stats_helper.buildItemPending('PENDING', pending)
        , stats_helper.buildItemSimple('NEGATIVE', negative_balance, '#cf1322')
        , stats_helper.buildItemSimple('PERSONAL', personal)
        , stats_helper.buildItemSimple('BUSINESS', business)
        , stats_helper.buildItemSimple('ADMIN', admin)
      ]
    return (<TableStats title="STATS" stats_array={items}/>)
  }

  renderContent(){

    return (
      <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
        <Table
            key="table_all_txs" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.profiles} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />
      </div>
      )
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
)(Profiles))
);