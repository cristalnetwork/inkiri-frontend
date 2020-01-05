import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import * as api from '@app/services/inkiriApi';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import * as columns_helper from '@app/components/TransactionTable/columns';
import TableStats from '@app/components/TransactionTable/stats'; 
import * as stats_helper from '@app/components/TransactionTable/stats';

import { Card, PageHeader, Button, Table } from 'antd';

import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';

import * as utils from '@app/utils/utils';

import _ from 'lodash';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

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
    
    this.props.setLastRootMenuFullpath(this.props.location.pathname);
    const pathname = `/${this.props.actualRole}/create-account`
    const {formatMessage} = this.props.intl;
    const button = (<Button key="account_create_notif_button"

                          type="link" 
                          onClick={()=>{ 
                            this.props.history.push({
                              pathname: pathname
                            })
                          }} size="small">{ formatMessage({id:'pages.bankadmin.profiles.redirect.account_creation'}) }</Button>);
    //
    
    const title           = formatMessage({id:'pages.bankadmin.profiles.redirect.account_creation_notification'});
    const message         = formatMessage(
                              {id:'pages.bankadmin.profiles.redirect.account_creation_message'}
                              , { button:button });
    components_helper.notif.infoNotification(title, (<p key="oo"> {message} </p>));
  }
  //
  onButtonClick(profile){

    this.props.setLastRootMenuFullpath(this.props.location.pathname);
    
    this.props.history.push({
      pathname: `/${this.props.actualRole}/profile`
      , state: { 
          profile:  profile, 
          referrer: this.props.location.pathname
        }
    })

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
      const title = this.props.intl.formatMessage({id:'pages.bankadmin.profiles.error.retrieving_profiles'});
      components_helper.notif.exceptionNotification(title, e);
      return;
    } 
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
      const title   = this.props.intl.formatMessage({id:'pages.bankadmin.profiles.reached_end_of_profiles'});
      const message = this.props.intl.formatMessage({id:'pages.bankadmin.profiles.reached_end_of_profiles_message'});
      components_helper.notif.infoNotification(title, message);
    }
  }

  
  
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProfiles()}>
        <InjectMessage id="pages.bankadmin.profiles.load_more_profiles" />
      </Button>)
  }
  //
  render() {
    const content               = this.renderContent();
    const {routes, loading}     = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadProfiles()} ></Button>,
            <Button size="small" type="primary" key="_new_profile" icon="plus" onClick={()=>{this.onNewProfile()}}> <InjectMessage id="pages.bankadmin.profiles.profile" /></Button>,
          ]}
          title={<InjectMessage id="pages.bankadmin.profiles.title" />}
        />
        
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
  //
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
)( injectIntl(Profiles)))
);