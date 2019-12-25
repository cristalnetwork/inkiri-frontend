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

const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_MEMBER   = 'state_new_member';
const STATE_EDIT_MEMBER  = 'state_edit_member';

class Crew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      team:               null,
      job_positions:      [],
      active_view:        STATE_LIST_MEMBERS,
      active_view_object: null,
    };

    this.loadTeam                   = this.loadTeam.bind(this);  
    this.loadJobPositions           = this.loadJobPositions.bind(this);  
    this.onMembersListCallback      = this.onMembersListCallback.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewMember                = this.onNewMember.bind(this); 
    this.memberFormCallback         = this.memberFormCallback.bind(this);
  }

  getColumns(){
    return columns_helper.columnsForCrew(this.onMembersListCallback, this.state.job_positions);
  }
  
  componentDidMount(){
    this.loadTeams();  
    
  } 

  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
      });    
  }


  loadJobPositions = async () => {
    this.setState({loading:true});

    let data = null;

    try {
      // data = await api.bank.getJobPositions();
    } catch (e) {
      // this.openNotificationWithIcon("error", "Error retrieveing Job Positions", JSON.stringify(e));
      components_helper.notif.exceptionNotification("Error retrieveing Job Positions", e);
      this.setState({ loading:false})
      return;
    }
    // console.log(data.job_positions)
    this.setState({ job_positions: data.job_positions, loading:false})
  }

  loadTeams = async () => {

    this.setState({loading:true});

    let team = null;

    try {
      team = await api.bank.getTeam(this.props.actualAccountName);
    } catch (e) {
      components_helper.notif.infoNotification("Error retrieveing Team... or there is no team!", e);
      // this.openNotificationWithIcon("error", "Error retrieveing Team", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    } 
    // console.log(JSON.stringify(team));
    this.setState({ team: team, loading:false})
        
  }

  // Component Events
  
  render() {
    const content                          = this.renderContent();
    const {routes, active_view, loading }  = this.state;
    
    const buttons = (active_view==STATE_LIST_MEMBERS)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.loadTeam()} ></Button>, 
        <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewMember()}}> Member</Button>]
        :(null);
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title="Crew"
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {team, loading, active_view, active_view_object, job_positions } = this.state;

    
    if(active_view==STATE_EDIT_MEMBER)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <AddMemberForm key="add_member_form" 
                  callback={this.memberFormCallback} 
                  job_positions={job_positions} 
                  member={active_view_object}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }

    if(active_view==STATE_NEW_MEMBER)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <AddMemberForm key="add_member_form" callback={this.memberFormCallback} job_positions={job_positions}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }


    //if(active_view==STATE_LIST_MEMBERS)  
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
                key="team_members" 
                rowKey={record => record.member.id} 
                loading={loading} 
                columns={this.getColumns()} 
                dataSource={members} 
                scroll={{ x: 700 }}
                />
          </div>
        </Card>
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