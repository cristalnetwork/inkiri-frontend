import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance';

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SalaryForm from '@app/components/Form/salary';
import * as form_helper from '@app/components/Form/form_helper';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

import EditableCell , {EditableFormRow } from '@app/components/TransactionTable/EditableTableRow';

const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_PAYMENT  = 'state_new_payment';

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

class Salaries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      team:               null,
      
      job_positions:      null,
      dataSource:         [],
      removed:            [],

      ...DEFAULT_RESULT,

      active_view:        STATE_LIST_MEMBERS,
    };

    this.loadTeam                   = this.loadTeam.bind(this);  
    this.loadJobPositions           = this.loadJobPositions.bind(this);  
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.getColumns                 = this.getColumns.bind(this);
    this.onRestoreList              = this.onRestoreList.bind(this); 
    this.removeCallback             = this.removeCallback.bind(this); 
    this.handleNewPayment           = this.handleNewPayment.bind(this); 
    this.salaryFormCallback         = this.salaryFormCallback.bind(this); 
  }

  handleNewPayment = () => {
    // this.openNotificationWithIcon("warning", "Not implemented yet");    
    this.setState({active_view:STATE_NEW_PAYMENT})
  }

  getColumns(){
    return columns_helper.columnsForSalaries(null, this.removeCallback, this.state.job_positions);
  }
  
  componentDidMount = async () => {
    const x_dummy = await this.loadJobPositions();
    const y_dummy = await this.loadTeam();  
    this.rebuildDataSourceAndSet();
  } 

  onRestoreList = () => {
    
    const dataSource = [...this.state.dataSource, ...this.state.removed];
    const removed    = [];
    this.setState({ dataSource: dataSource, removed: removed});
  }

  removeCallback = record => {
    const dataSource = [...this.state.dataSource];
    const removed    = [...this.state.removed, record];
    this.setState({ dataSource: dataSource.filter(item => item._id !== record._id), removed: removed});
  };

  salaryFormCallback = async (error, cancel, values) => {
    // console.log(` ## memberFormCallback(error:${error}, cancel:${cancel}, values:${values})`)
    // console.log(' memberFormCallback:', JSON.stringify(values))
    
    if(cancel)
    {
      this.setState({active_view:STATE_LIST_MEMBERS})
      return;
    }
    if(error)
    {
      return;
    }

    const {dataSource} = this.state;
    const total        = dataSource.reduce((acc, member) => acc + member.current_wage, 0);
    if(parseFloat(total)>parseFloat(this.props.balance))
    {
      const balance_txt = globalCfg.currency.toCurrencyString(this.props.balance);
      this.openNotificationWithIcon("error", `Total must be equal or less than balance ${balance_txt}!`); //`
      return;
    }

    this.setState({pushingTx:true});

    const that             =  this;
    const sender_priv      = this.props.actualPrivateKey;
    const sender_account   = this.props.actualAccountName;
    
    const {description, worked_month} = values;
    const to_amount_array = dataSource.map(item => { return{ 
                                                                account_name: item.member.account_name
                                                                , amount:     item.current_wage }});
    
    // console.log(JSON.stringify(to_amount_array));

    api.paySalaries(sender_account, sender_priv, to_amount_array, description, worked_month.format(form_helper.MONTH_FORMAT))
      .then((data) => {
        console.log(' paySalaries => (then#1) >>  ', JSON.stringify(data));
        that.setState({result:'ok', pushingTx:false, result_object:data});
        that.openNotificationWithIcon("success", 'Payments sent successfully');
      }, (ex) => {
        console.log(' paySalaries => (error#1) >>  ', JSON.stringify(ex));
        that.openNotificationWithIcon("error", 'An error occurred!', JSON.stringify(ex));
        that.setState({result:'error', pushingTx:false, error:JSON.stringify(ex)});
      });

  }


  backToDashboard = async () => {
    const dashboard = (this.props.actualRole=='business')?'extrato':'dashboard';
    this.props.history.push({
      pathname: `/${this.props.actualRole}/${dashboard}`
    })
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
    
  }

  resetPage(active_view){
    let my_active_view = active_view?active_view:STATE_LIST_MEMBERS;
    this.setState({ 
        active_view:   my_active_view
        , pushingTx:   false
        , ...DEFAULT_RESULT
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
    // console.log(JSON.stringify(team));
    // const dataSource = this.rebuildDataSource();
    
    this.setState({ 
        team:        team, 
        // dataSource:  dataSource,
        loading:     false})
        
  }

  loadJobPositions = async () => {
    this.setState({loading:true});

    let data = null;

    try {
      data = await api.bank.getJobPositions();
    } catch (e) {
      this.openNotificationWithIcon("error", "Error retrieveing Default Job positions", JSON.stringify(e));
      this.setState({ loading:false})
      return;
    }
    this.setState({ job_positions: data.job_positions, loading:false})
  }

  rebuildDataSourceAndSet = () =>{
    const dataSource = this.rebuildDataSource();
    this.setState({ dataSource:  dataSource}) 
  }

  rebuildDataSource = () =>{
    const {job_positions, team} = this.state;
    let dataSource = [];
    if(team && team.members)
    {
      dataSource = team.members.map(member=> { 
        const _position = job_positions?`Bolsa ${job_positions.filter(pos=>pos.key==member.position)[0].title}`:member.position;  
        return {...member
            , current_wage:   member.wage
            , current_reason: _position }
      });
    }
    return dataSource;
  }
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  
  //

  handleSave = row => {
    if(isNaN(row.current_wage))
      row.current_wage=row.wage;
    if(row.current_reason)
      row.current_reason=utils.firsts(row.current_reason, 30, false);
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item._id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };


  
  renderContent(){
    const {active_view, job_positions, dataSource, result } = this.state;

    if(result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      const result = (<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />);
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
                <div className="ly-main-content content-spacing cards">
                  <section className="mp-box mp-box__shadow money-transfer__box">
                    {result}
                  </section>
                </div>      
              </div>);
    }

    if(active_view==STATE_NEW_PAYMENT)
    {
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="ly-main-content content-spacing cards">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
                <SalaryForm key="salary_payment_form" callback={this.salaryFormCallback} job_positions={job_positions} members={dataSource}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }

    return this.renderTable();
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
          title="Crew members & wages"  
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          // headStyle={{display:'none'}}
          actions={[
            <Button onClick={this.handleNewPayment} disabled={loading||(!dataSource||dataSource.length==0)} type="primary"> <FontAwesomeIcon icon="money-check-alt" size="lg" color="white"/>&nbsp;&nbsp;NEW SALARIES PAYMENT </Button> 
          ]}
        >
          <div style={{ background: '#fff'}}>
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
  }
  //

  render() {
    const content               = this.renderContent(); 
    const {routes, active_view, removed}  = this.state;
    const button = (removed && removed.length>0)?
      (<Button size="small" type="primary" key="_redo" icon="redo" onClick={()=>{this.onRestoreList()}}> RESTORE MEMBERS</Button>)
      :(null);
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
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        actualRole:           loginRedux.actualRole(state),
        balance:              balanceRedux.userBalance(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Salaries))
);