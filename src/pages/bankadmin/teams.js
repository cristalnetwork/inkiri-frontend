import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as columns_helper from '@app/components/TransactionTable/columns';

import { Card, PageHeader, Tabs, Button, Icon, Table, Spin } from 'antd';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

import TeamsTable , {MODE_TEAMS, MODE_TEAM_MEMBERS} from "@app/components/Teams/teams-table";
const STATE_LIST_MEMBERS = 'state_list_members';
const STATE_NEW_MEMBER   = 'state_new_member';
const STATE_EDIT_MEMBER  = 'state_edit_member';


class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :            routesService.breadcrumbForPaths(props.location.pathname),
      loading:            false,
      pushingTx:          false,
      team:               null,
      active_view:        STATE_LIST_MEMBERS,
      active_view_object: null,
      intl:               {}
    };

    this.onTeamCallback             = this.onTeamCallback.bind(this);
    // this.onTeamMemberCallback       = this.onTeamMemberCallback.bind(this);
  }
  
  componentDidMount(){
    
    const {formatMessage} = this.props.intl;
    const total_wages = formatMessage({id:'pages.bankadmin.teams.total_wages'});
    const title = formatMessage({id:'pages.bankadmin.teams.title'});
    
    this.setState({intl:{total_wages, title}});
  
  } 

  onTeamCallback =(team) =>{

  }

  render() {
    const content                                = this.renderContent();
    const {routes, active_view, loading, intl }  = this.state;
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={intl.title}
        >
          
        </PageHeader>
        
          {content}
        
      </>
    );
  }
  //
  renderContent(){
    const {team, loading, active_view, active_view_object } = this.state;

    // if(active_view==STATE_LIST_MEMBERS)  
    // {
    //   const members         = team?team.members||[]:[];
    //     return (
    //       <Card
    //           key="card_table_all_requests"
    //           className="styles listCard"
    //           bordered={false}
    //           style={{ marginTop: 24 }}
    //           headStyle={{display:'none'}}
    //         >
    //           <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
    //             <Table
    //                 key="team_members" 
    //                 rowKey={record => record.member.id} 
    //                 loading={loading} 
    //                 columns={this.getColumns()} 
    //                 dataSource={members} 
    //                 scroll={{ x: 700 }}
    //                 />
    //           </div>
    //         </Card>
    //       )
    // }

    return (
      <Card
          key="card_table_all_requests"
          className="styles listCard"
          bordered={false}
          style={{ marginTop: 24 }}
          headStyle={{display:'none'}}
        >
        <TeamsTable 
          callback={this.onTeamCallback}
          mode={MODE_TEAMS} />
      </Card>
      );
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
        
    })
)(injectIntl(Teams)))
);