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


class Crew extends Component {
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
    
  }

  getColumns(){
    return columns_helper.columnsForProfiles(this.onButtonClick);
  }
  
  componentDidMount(){
    this.loadProfiles(true);  
  } 

  onNewProfile = () => {
    
    this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

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

  }

  loadProfiles = async (first) => {

    this.setState({loading:false});
    return;


    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
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
  
  
  render() {
    const content               = this.renderContent();
    
    const {routes}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewProfile()}}> Member</Button>,
          ]}
          title="Crew"
        >
          
        </PageHeader>
        
        <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
          {content}
        </Card>

      </>
    );
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
)(Crew))
);