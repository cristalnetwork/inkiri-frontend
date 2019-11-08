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

class Providers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      providers:      [],
      
      page:           -1, 
      limit:          globalCfg.api.default_page_size,
      can_get_more:   true,
      cursor:         '',
      stats:          undefined,
      // active_tab:     DISPLAY_ALL_TXS
    };

    this.loadProviders               = this.loadProviders.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    // this.onTableChange              = this.onTableChange.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewProvider               = this.onNewProvider.bind(this); 
    this.renderAccountTypeFilter    = this.renderAccountTypeFilter.bind(this);
    this.renderAccountStateFilter   = this.renderAccountStateFilter.bind(this);
    this.renderFilterContent        = this.renderFilterContent.bind(this);
  }

  getColumns(){
    return [
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                sortDirections: ['descend'],
                defaultSortOrder: 'descend',
                // sorter: (a, b) => a.block_time_number - b.block_time_number,
              },
              {
                title: 'CNPJ',
                dataIndex: 'cnpj',
                key: 'cnpj'
              },
              //
              {
                title: 'Contact',
                dataIndex: 'email',
                key: 'email',
                render: (email, record) => (
                  <>
                    <span key={'email_'+record.id}>
                     <Icon type="mail" />&nbsp;{email}
                    </span><br/>
                    <span key={'phone_'+record.id}> 
                      <Icon type="phone" />&nbsp;{record.phone}
                    </span>
                  </>)
              },
              {
                title: 'Address',
                dataIndex: 'address',
                key: 'address',
                render: (address, record) => (
                  <span key={address._id}>
                   <Icon type="environment" /> {address.street}, {address.city}, CP {address.zip}, {address.state}, {address.country}
                  </span>
                  )
              },
              {
                title: 'Category',
                key: 'category',
                dataIndex: 'category',
              },
              //
              {
                title: 'Products/Services',
                dataIndex: 'products_services',
                key: 'products_services',
                
              },
              {
                title: 'Bank Accounts',
                dataIndex: 'bank_accounts',
                key: 'bank_accounts',
                render: (bank_accounts, record) => (
                  <span key={'bank_accounts_'+record.id}>
                    <Icon type="bank" /> {bank_accounts.map(bank_account => <span key={'bank_accounts'+bank_account._id}>{bank_account.bank_name}, {bank_account.agency}, {bank_account.cc}</span>)} 
                  </span>
                  )
              },
              //
              {
                title: 'Action',
                fixed: 'right',
                width: 100,
                key: 'action',
                render: (record) => 
                    (<>
                     <Button key={'process_'+record.id} onClick={()=>{ this.onButtonClick(record) }} icon="profile" size="small">Profile</Button>
                     </>)
                  ,
              },
            ];
  }

  componentDidMount(){
    this.loadProviders(true);  
  } 

  onNewProvider = () => {
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/create-provider`
      , state: { 
          referrer: this.props.location.pathname
        }
    })    
  }

  onButtonClick(provider){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/${this.props.actualRole}/provider-profile`
      , state: { 
          provider: provider
          , referrer: this.props.location.pathname
        }
    })

  }


  loadProviders = async (first) => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    
    // let page           = (this.state.page<0)?0:(this.state.page+1);
    // const limit          = this.state.limit;
    let that           = this;
    
    api.bank.listProviders()
    .then( (res) => {

        console.log(' >> api.bank.listProviders >>', JSON.stringify(res))
        that.onNewData(res, first);
        
      } ,(ex) => {
        console.log(' api.bank.listProviders ERROR#1', JSON.stringify(ex) )
        that.setState({loading:false});  
      } 
    );
    
  }

  onNewData(providers, first){
    
    if(!providers)
      providers=[];
    const _providers      = [...this.state.providers, ...providers];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _providers.length;
    pagination.total      = _providers.length;

    const has_received_new_data = (providers && providers.length>0);

    this.setState({pagination:pagination, providers:_providers, can_get_more:(has_received_new_data && providers.length==this.state.limit), loading:false})

    if(!has_received_new_data && !first)
    {
      this.openNotificationWithIcon("info", "End of list","You have reached the end of list!")
    }
    
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  // Component Events
  

  
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProviders()}>More!!</Button>)
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
    console.log(' ** renderAccountStateFilter')
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
    console.log(' ** renderAccountTypeFilter')
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
    //
    const filters = (<></>); //this.renderFilterContent();
    const content = this.renderUMIContent();
    const _href   = globalCfg.bank.customers;
    const {routes}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button key="_new_provider" size="small" type="primary" icon="plus" onClick={()=>{this.onNewProvider()}}> Provider</Button>,
            
          ]}
          title="Providers"
          subTitle="Providers Administration"
        >
          
        </PageHeader>
        {filters}
        {content}

      </>
    );
  }
//

  renderUMIContent(){
    
    return  (<>
      <div className="styles standardList" style={{ marginTop: 24 }}>
        <Card
          className="styles listCard"
          bordered={false}
          title="List of Providers"
          style={{ marginTop: 24 }}
        >
          
          <Table
            key="table_all_txs" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={this.getColumns()} 
            dataSource={this.state.providers} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />

        </Card>
      </div>
    </>)
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
)(Providers))
);