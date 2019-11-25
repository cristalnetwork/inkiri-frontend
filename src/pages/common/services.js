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

import AddMemberForm from '@app/components/Form/add_member';
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
      
      services:           [],
      page:               -1, 
      limit:              globalCfg.api.default_page_size,
      can_get_more:       true,
      
      active_view:        STATE_LIST_SERVICES,
      active_view_object: null,


    };

    this.loadServices               = this.loadServices.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.onServicesListCallback     = this.onServicesListCallback.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewService                = this.onNewService.bind(this); 
    this.serviceFormCallback         = this.serviceFormCallback.bind(this);
    this.renderFooter               = this.renderFooter.bind(this); 
  }

  getColumns(){
    return columns_helper.columnsForServices(this.onServicesListCallback);
  }
  
  componentDidMount(){
    this.loadServices();  
  } 

  onNewService = () => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_SERVICE})
  }

  onEditMember = (member) => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view: STATE_EDIT_SERVICE, active_view_object:member})
  }

  onRemoveMember = (member) => {
    const that           = this;
    Modal.confirm({
      title: 'Confirm delete member.',
      content: (<p>You are about to remove <b>{member.member.account_name}</b> from the crew. Continue or cancel.</p>),
      onOk() {
        const {team}         = that.state;
        if(!team)
        {
          that.setState({pushingTx:false})
          that.openNotificationWithIcon('error', 'There was an error. We cant get the team id. Please reload page.');
          return;
        }
        const teamId         = team?team.id:null;
        const account_name   = that.props.actualAccountName;
        const members = team.members.filter(item => item._id!=member._id)
        that.setState({pushingTx:true})
        api.bank.createOrUpdateTeam(teamId, account_name, members)
          .then((res)=>{
            that.openNotificationWithIcon("success", "Member removed from team successfully!")    
            that.loadTeam();
            that.resetPage(STATE_LIST_SERVICES);
          }, (err)=>{
            console.log(' >> createOrUpdateTeam >> ', JSON.stringify(err));
            that.openNotificationWithIcon("error", "An error occurred", JSON.stringify(err))    
            that.setState({pushingTx:false});
          })
     
      },
      onCancel() {
        
      },
    });

  }

  onServicesListCallback(member, event){

    switch(event){
      case columns_helper.events.VIEW:
        console.log(event)
        break;
      case columns_helper.events.REMOVE:
        this.onRemoveMember(member);
        break;
      case columns_helper.events.EDIT:
        // console.log(event)
        this.onEditMember(member);
        break;
    }
    return;

  }

  serviceFormCallback = async (error, cancel, values) => {
    // console.log(` ## serviceFormCallback(error:${error}, cancel:${cancel}, values:${values})`)
    // console.log(' serviceFormCallback:', JSON.stringify(values))
    
    if(cancel)
    {
      this.setState({active_view:STATE_LIST_SERVICES})
      return;
    }
    if(error)
    {
      return;
    }

    const that           = this;
    const {team}         = this.state;
    const teamId         = team?team.id:null;
    const account_name   = this.props.actualAccountName;
    this.setState({pushingTx:true})
    let member_profile   = null;
    
    // New member!
    if(!values._id)
      try{
        member_profile = await api.bank.getProfile(values.member);
      }catch(e){
        this.setState({pushingTx:false})
        this.openNotificationWithIcon('error', 'Cant retrieve new member profile!');
        return;
      }         


    const new_member = {
      _id:        member_profile ? undefined : values._id,
      member:     member_profile ? member_profile._id : values.member,
      position:   values.position,
      wage:       values.input_amount.value
    }
    

    const members        = team
      ? [  ...(team.members.filter(member=>member._id!=new_member._id))
                .map((member) => {return {_id        : member._id
                                          , member   : member.member._id
                                          , position : member.position
                                          , wage     : member.wage};
                                        })
           , new_member]
      : [new_member];

    // console.log(' -> values -> ', JSON.stringify(values));
    // console.log(' -> members -> ', JSON.stringify(members));
    // return;
    api.bank.createOrUpdateTeam(teamId, account_name, members)
      .then((res)=>{
        that.openNotificationWithIcon("success", "Member saved to team successfully!")    
        that.loadTeam();
        that.resetPage(STATE_LIST_SERVICES);
      }, (err)=>{
        console.log(' >> createOrUpdateTeam >> ', JSON.stringify(err));
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
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let page           = (this.state.page<0)?0:(this.state.page+1);
    const limit        = this.state.limit;
    let that           = this;
    
    let services = [];

    try {
      services = await api.bank.getServices(this.props.actualAccountName, page, limit);
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Services", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    } 
    // console.log(JSON.stringify(team));
    // this.setState({ team: team, loading:false})
    this.onNewData (services) ;
  }

  onNewData(services){
    
    const _services       = [...this.state.services, ...services];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _services.length;
    pagination.total      = _services.length;

    const has_received_new_data = (services && services.length>0);

    this.setState({pagination:pagination, services:_services, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data)
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
    
    const button = (active_view==STATE_LIST_SERVICES)
      ?(<Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewService()}}> Service</Button>)
        :(null);
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadServices()} ></Button>,
            button,
          ]}
          title="Serviços oferecidos"
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {team, loading, active_view, active_view_object, job_positions } = this.state;

    
    if(active_view==STATE_EDIT_SERVICE)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <AddMemberForm key="add_member_form" callback={this.serviceFormCallback} job_positions={job_positions} member={active_view_object}/>    
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
                <AddMemberForm key="add_member_form" callback={this.serviceFormCallback} job_positions={job_positions}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }


    //if(active_view==STATE_LIST_SERVICES)  
    const members         = team?team.members||[]:[];
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
                dataSource={this.state.txs} 
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