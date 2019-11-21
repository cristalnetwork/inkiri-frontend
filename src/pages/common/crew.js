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

import AddMemberForm from '@app/components/Form/add_member';
import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

const routes = routesService.breadcrumbForFile('accounts');

const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_MEMBER   = 'state_new_member';
const STATE_EDIT_MEMBER  = 'state_edit_member';

class Crew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      pushingTx:      false,
      team:           null,
      job_positions:  [],
      active_view:    STATE_LIST_MEMBERS,
    };

    this.loadTeam                   = this.loadTeam.bind(this);  
    this.loadJobPositions           = this.loadJobPositions.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewMember                = this.onNewMember.bind(this); 
    this.memberFormCallback         = this.memberFormCallback.bind(this);
  }

  getColumns(){
    return columns_helper.columnsForProfiles(this.onButtonClick);
  }
  
  componentDidMount(){
    this.loadTeam();  
    this.loadJobPositions();
  } 

  onNewMember = () => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_MEMBER})
  }

  onButtonClick(member){

    return;

  }

  memberFormCallback = (e) => {

  }
  loadJobPositions = async () => {
    this.setState({loading:true});

    let job_positions = null;

    try {
      job_positions = await api.bank.getJobPositions();
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Team", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    }

    this.setState({ job_positions: job_positions.job_positions, loading:false})
  }
  loadTeam = async () => {

    this.setState({loading:true});

    let team = null;

    try {
      team = await api.bank.getTeam(this.props.actualAccountName);
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Team", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    } 
    // console.log(profiles)
    this.setState({ team: team, loading:false})
        
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
            <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewMember()}}> Member</Button>,
          ]}
          title="Crew"
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }

  renderContent(){
    const {team, loading, active_view, job_positions } = this.state;
    if(active_view==STATE_NEW_MEMBER)
    {
      // return (
          
      //       <section className="mp-box mp-box__shadow money-transfer__box">
      //         <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
      //           <AddMemberForm key="add_member_form" callback={this.memberFormCallback} job_positions={job_positions}/>    
      //         </Spin>
      //       </section>
          
      //   );
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
                rowKey={record => record.id} 
                loading={loading} 
                columns={this.getColumns()} 
                dataSource={members} 
                footer={() => this.renderFooter()}
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