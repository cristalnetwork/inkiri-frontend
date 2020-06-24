import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as graphqlRedux from '@app/redux/models/graphql'
import * as apiRedux from '@app/redux/models/api';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as columns_helper from '@app/components/TransactionTable/columns';

import { Card, PageHeader, Button} from 'antd';
import { Modal, Table, Spin } from 'antd';

import AddMemberForm from '@app/components/Form/add_member';
import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_MEMBER   = 'state_new_member';
const STATE_EDIT_MEMBER  = 'state_edit_member';

class Crew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            props.isLoading,
      isFetching:         props.isFetching,
      
      team:               props.team,
      job_positions:      props.jobPositions,
      intl:               {},
      active_view:        STATE_LIST_MEMBERS,
      active_view_object: null,
    };

    this.loadTeam                   = this.loadTeam.bind(this);
    this.onMembersListCallback      = this.onMembersListCallback.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewMember                = this.onNewMember.bind(this); 
    this.memberFormCallback         = this.memberFormCallback.bind(this);
  }

  getColumns(){
    return columns_helper.columnsForCrew(this.onMembersListCallback, this.state.job_positions);
  }
  
  componentDidMount(){
    const {team, job_positions} = this.state;
    if(!team)    
    {
      this.loadTeam();
    }

    if(utils.objectNullOrEmpty(job_positions))
    {
      this.props.loadConfig();
    }

    const {formatMessage} = this.props.intl;
    const check_fields = formatMessage({id:'pages.common.crew.title.check_fields'});
    const state_list_members = formatMessage({id:'pages.common.crew.title.state_list_members'});
    const state_new_member = formatMessage({id:'pages.common.crew.title.state_new_member'});
    const state_edit_member = formatMessage({id:'pages.common.crew.title.state_edit_member'});
    const verify_credentials = formatMessage({id:'pages.common.crew.verify_credentials'});
    const confirm_delete = formatMessage({id:'pages.common.crew.confirm_delete'});
    const error_cant_get_team_id = formatMessage({id:'pages.common.crew.error_cant_get_team_id'});
    const error_cant_get_member_profile = formatMessage({id:'pages.common.crew.error_cant_get_member_profile'});
    const error_already_a_crew_member = formatMessage({id:'pages.common.crew.error_already_a_crew_member'});
    const new_member = formatMessage({id:'pages.common.crew.new_member'});
    const crew = formatMessage({id:'pages.common.crew.crew'});
    const pushing_tx = formatMessage({id:'pages.common.crew.pushing_tx'});
    
    this.setState({intl:{check_fields, state_list_members, state_new_member, state_edit_member, verify_credentials, confirm_delete, error_cant_get_team_id, error_cant_get_member_profile, error_already_a_crew_member, new_member, crew, pushing_tx}});
  } 

  componentDidUpdate(prevProps, prevState) 
  {
    let new_state = {};
    if(prevProps.jobPositions !== this.props.jobPositions) {
      new_state = {...new_state, job_positions: this.props.jobPositions}
    }

    if(prevProps.team !== this.props.team) {
      new_state = {...new_state, team: this.props.team}
    }

    if(prevProps.isLoading !== this.props.isLoading) {
      new_state = {...new_state, loading: this.props.isLoading}
    }

    if(prevProps.isFetching!=this.props.isFetching){
      new_state = {...new_state, isFetching:this.props.isFetching}
    }
    
    if(!utils.arraysEqual(prevProps.getErrors, this.props.getErrors)){
    }

    if(!utils.arraysEqual(prevProps.getResults, this.props.getResults) ){
      const that = this;
      setTimeout(()=> {
        that.loadTeam();
        that.resetPage(STATE_LIST_MEMBERS);
      } ,100);
    }

    if(Object.keys(new_state).length>0)      
      this.setState(new_state, () => {
            // ??
        });
  }

  loadTeam =() =>{
    if(!this.props.actualAccountName || !this.props.actualRoleId)
    {
      components_helper.notif.warningNotification(this.state.intl.verify_credentials);
      return;
    }
    this.props.loadData(this.props.actualAccountName, this.props.actualRoleId)
  }
  onNewMember = () => {
    this.setState({active_view:STATE_NEW_MEMBER})
  }

  onEditMember = (member) => {
    this.setState({active_view: STATE_EDIT_MEMBER, active_view_object:member})
  }

  onRemoveMember = (member) => {
    const that           = this;
    const confirm_delete_message = this.props.intl.formatMessage({id:'pages.common.crew.confirm_delete_message'}, {member_account_name:member.member.account_name, bold: str => <b key={Math.random()}>{str}</b>});
    Modal.confirm({
      title: this.state.intl.confirm_delete ,
      content: (<p>{confirm_delete_message}}</p>),
      onOk() {
        const {team}         = that.state;
        if(!team)
        {
          components_helper.notif.infoNotification(this.state.intl.error_cant_get_team_id);
          return;
        }
        const teamId         = team?team._id:null;
        const account_name   = that.props.actualAccountName;
        const members = team.members.filter(item => item._id!=member._id)

        const _function = 'bank.createOrUpdateTeam';
        that.props.callAPI(_function, [teamId, account_name, members])
     
      },
      onCancel() {
        
      },
    });

  }

  onMembersListCallback(member, event){

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

  memberFormCallback = async (error, cancel, values) => {
    if(cancel)
    {
      this.setState({active_view:STATE_LIST_MEMBERS})
      return;
    }
    if(error)
    {
      return;
    }

    const that           = this;
    const {team}         = this.state;
    const teamId         = team?team._id:null;
    const account_name   = this.props.actualAccountName;
    let member_profile   = null;
    
    // New member!
    if(!values._id)
      try{
        member_profile = await api.bank.getProfile(values.member);
      }catch(e){
        components_helper.notif.exceptionNotification(this.state.intl.error_cant_get_member_profile, e);
        return;
      }         


    const new_member = {
      _id:        member_profile ? undefined : values._id,
      member:     member_profile ? member_profile._id : values.member,
      position:   values.position,
      wage:       values.input_amount.value
    }
    
    // already a member?
    if(!values._id && team && team.members && team.members.filter(member => member.member._id==new_member.member).length>0)
    {
      components_helper.notif.errorNotification(this.state.intl.error_already_a_crew_member);
      return;
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

    
    const _function = 'bank.createOrUpdateTeam';
    that.props.callAPI(_function, [teamId, account_name, members])
  }

  resetPage(active_view){
    let my_active_view = active_view?active_view:this.state.active_view;
    this.setState({ 
        active_view:   my_active_view
      });    
  }

  // Component Events
  
  render() {
    const content                          = this.renderContent();
    const {routes, active_view, loading }  = this.state;
    
    const buttons = (active_view==STATE_LIST_MEMBERS)
      ?[<Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.loadTeam()} ></Button>, 
        <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewMember()}}> {this.state.intl.new_member}</Button>]
        :(null);
    //
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={buttons}
          title={this.state.intl.crew}
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {team, loading, active_view, active_view_object, job_positions, isFetching } = this.state;

    
    if(active_view==STATE_EDIT_MEMBER)
    {
      //
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
          <div className="">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={isFetching} delay={500} tip={this.state.intl.pushing_tx}>
                <AddMemberForm key="edit_member_form" 
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
          <div className="">
            <section className="mp-box mp-box__shadow money-transfer__box">
              <Spin spinning={isFetching} delay={500} tip={this.state.intl.pushing_tx}>
                <AddMemberForm key="add_member_form" callback={this.memberFormCallback} job_positions={job_positions}/>    
              </Spin>
            </section>
          </div>      
        </div>);
    }


    //if(active_view==STATE_LIST_MEMBERS)  
    const members         = team?team.members||[]:[];
    const total_members   = members?members.length:0;
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
                rowKey={record => record.member._id} 
                loading={loading} 
                columns={this.getColumns()} 
                dataSource={members}
                pagination={{pageSize:total_members, total:total_members}} 
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
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRoleId:       loginRedux.actualRoleId(state),
        actualRole:         loginRedux.actualRole(state),
        jobPositions:       graphqlRedux.jobPositions(state),
        team:               graphqlRedux.team(state),
        isLoading:          graphqlRedux.isLoading(state),
        
        isFetching:         apiRedux.isFetching(state),
        getErrors:          apiRedux.getErrors(state),
        getLastError:       apiRedux.getLastError(state),
        getResults:         apiRedux.getResults(state),
        getLastResult:      apiRedux.getLastResult(state)
    }),
    (dispatch)=>({
        callAPI:            bindActionCreators(apiRedux.callAPI, dispatch),

        loadConfig:         bindActionCreators(graphqlRedux.loadConfig, dispatch),
        loadData:           bindActionCreators(graphqlRedux.loadData, dispatch),
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)( injectIntl(Crew)))
);