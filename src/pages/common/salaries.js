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


import EditableCell , {EditableFormRow } from '@app/components/TransactionTable/EditableTableRow';

const routes = routesService.breadcrumbForFile('accounts');

const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_MEMBER   = 'state_new_member';
const STATE_EDIT_MEMBER  = 'state_edit_member';

class Salaries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      team:               null,
      job_positions:      [],
      dataSource:         []
    };

    this.loadTeam                   = this.loadTeam.bind(this);  
    this.loadJobPositions           = this.loadJobPositions.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewSalary                = this.onNewSalary.bind(this); 
  }

  getColumns(){
    return columns_helper.columnsForSalaries(null, this.state.job_positions);
  }
  
  componentDidMount(){
    this.loadTeam();  
    this.loadJobPositions();
  } 

  onNewSalary = () => {
    
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_MEMBER})
  }

  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
      });    
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
    console.log(JSON.stringify(team));
    let dataSource = [];
    if(team && team.members)
      dataSource = team.members.map(member=> { return {...member
          , current_wage:member.wage
          , current_reason:member.position}} )
    this.setState({ 
        team:        team, 
        dataSource:  dataSource,
        loading:     false})
        
  }

  loadJobPositions = async () => {
    this.setState({loading:true});

    let data = null;

    try {
      data = await api.bank.getJobPositions();
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Team", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    }
    // console.log(data.job_positions)
    this.setState({ job_positions: data.job_positions, loading:false})
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  
  //

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item._id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };


  //
  renderContent(){
    const {team, loading } = this.state;
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
                rowKey={record => record._id} 
                loading={loading} 
                columns={this.getColumns()} 
                dataSource={members} 
                scroll={{ x: 700 }}
                />
          </div>
        </Card>
      )
  }

  //
  renderTable(){
    const {team, loading, dataSource} = this.state;
    const components       = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns          = this.getColumns().map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

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
                rowKey={record => record._id} 
                loading={loading} 
                columns={columns}
                components={components} 
                dataSource={dataSource} 
                scroll={{ x: 700 }}
                rowClassName={() => 'editable-row'}
                />
          </div>
        </Card>
      );

    // return (
    //   <div>
    //     <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
    //       Add a row
    //     </Button>
    //     <Table
    //       components={components}
    //       rowClassName={() => 'editable-row'}
    //       bordered
    //       dataSource={dataSource}
    //       columns={columns}
    //     />
    //   </div>
    // );
  }
  //

  render() {
    const content               = this.renderTable(); //this.renderContent();
    
    
    const {routes, active_view}  = this.state;
    const button = (<Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewSalary()}}> SALARIES PAYMENT</Button>);
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            button,
          ]}
          title="Salaries"
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //

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
)(Salaries))
);