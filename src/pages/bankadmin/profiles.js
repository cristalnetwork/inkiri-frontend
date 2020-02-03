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

import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';
import * as gqlService from '@app/services/inkiriApi/graphql'
import AccountFilter from '@app/components/Filters/account';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
      filter:         {},
    };

    this.loadProfiles               = this.loadProfiles.bind(this);  
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    // this.onTabChange                = this.onTabChange.bind(this);
    // this.onTableChange              = this.onTableChange.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewProfile               = this.onNewProfile.bind(this); 

    this.filterCallback             = this.filterCallback.bind(this);
    this.myExportRef    = React.createRef();
    this.timeout_id     = null;   
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

  getAccountFilter = (increase_page_if_needed) => {
    const page             = (this.state.page<=0)
      ?0
      :(increase_page_if_needed)
        ?(this.state.page+1)
        :this.state.page;

    const {limit, filter}  = this.state;
    
    return {limit:limit.toString(), page:page.toString(), ...filter, account_type:'personal'};
  }

  loadProfiles = async () => {
    let that      = this;
    const filter = this.getAccountFilter(true);
    try{
      const data = await gqlService.listUsers(filter);
      console.log(data)
      that.onNewData(data);
    }
    catch(ex){
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'pages.bankadmin.profiles.error.retrieving_profiles'}), ex);
      that.setState({loading:false});  
    }

  }

  onNewData(profiles){
    
    const _profiles             = [...this.state.profiles, ...profiles];
    const pagination            = {...this.state.pagination};
    pagination.pageSize         = _profiles.length;
    pagination.total            = _profiles.length;

    const has_received_new_data = (profiles && profiles.length>0);
    const can_get_more          = (has_received_new_data && profiles.length==this.state.limit)
    const page           = (this.state.page<0)?0:(this.state.page+1);

    this.setState({pagination:    pagination
                , profiles:       profiles
                , can_get_more:   (has_received_new_data && profiles.length==this.state.limit)
                , loading:        false
                , page:           page})

    if(!has_received_new_data)
    {
      const title   = this.props.intl.formatMessage({id:'pages.bankadmin.profiles.reached_end_of_profiles'});
      const message = this.props.intl.formatMessage({id:'pages.bankadmin.profiles.reached_end_of_profiles_message'});
      components_helper.notif.infoNotification(title, message);
    }
  }
  //
   filterCallback = (error, cancel, values, refresh) => {
    
    if(cancel)
    {
      return;
    }
    if(error)
    {
      return;
    }

    if(refresh)
    {
      clearTimeout(this.timeout_id);
      this.timeout_id = setTimeout(()=> {
        this.reloadProfiles();
      } ,100);
      return;
    }
    
    console.log(' accountFilter: ', JSON.stringify(values));

    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=> {
      this.setState({filter:(values||{})}, ()=>{
        this.reloadProfiles();
      })
    } ,100);
    
  }

  exportButton = () => [<a className="hidden" key="export_button_dummy" ref={this.myExportRef}  href={this.state.sheet_href} target="_blank" >x</a>, <Button key="export_button" onClick={this.handleExportClick} size="small" style={{position: 'absolute', right: '8px', top: '16px'}} title={this.props.intl.formatMessage({id:'global.export_sheet_remember_allowing_popups'})}><FontAwesomeIcon icon="file-excel" size="sm" color="black"/>&nbsp;<InjectMessage id="global.export_list_to_spreadsheet" /></Button>];
  //
  handleExportClick = async () => {

    const filter = this.getAccountFilter(false);
      
    console.log(filter)
    if(!filter)
      return;

    this.setState({loading:true});
    const that       = this;
    try{
      const data = await gqlService.exportUsers(filter);
      
      this.setState({loading:false});
      console.log(data)
      if(data && data.file_id)
      {
        console.log('SETTING STATE')
        this.setState( { sheet_href: `https://docs.google.com/spreadsheets/d/${data.file_id}` }
                        , () => { 
                          console.log('CALLING BUTTON?')
                         if(!this.myExportRef)    
                            return;
                          console.log('YES')
                          this.myExportRef.current.click();
                        });
        
        return;
      } 
      console.log('NOooooooooooooooo')
      if(data && data.error)
      {
        components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), data.error);
        return;
      }
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}));
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TransactionTable.index.error_exporting'}), e);
      return;
    }

    this.setState({loading:false});
  }
  //  
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
          <AccountFilter 
            callback={this.filterCallback} 
            hidden_fields={['balance_status', 'account_type']} />

          {content}

        </Card>

      </>
    );
  }
  //
  renderContent(){

    return (
      <div style={{ background: '#fff', minHeight: 360, marginTop: 24}}>
        <ResizeableTable
            title = { () => this.exportButton() }
            key="table_all_txs" 
            rowKey={record => record._id} 
            loading={this.state.loading} 
            columns_def={this.getColumns()} 
            dataSource={this.state.profiles} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            onRow={ (record, rowIndex) => {
                  return { 
                    onDoubleClick: event => { this.onButtonClick(record) }
                  };
            }}
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