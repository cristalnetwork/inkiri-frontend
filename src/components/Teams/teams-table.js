import React, {Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as graphqlRedux from '@app/redux/models/graphql'

import * as globalCfg from '@app/configs/global';
import * as gqlService from '@app/services/inkiriApi/graphql'

import { Button, Table } from 'antd';

import * as columns_helper from '@app/components/TransactionTable/columns';
import * as components_helper from '@app/components/helper';

import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

export const  MODE_TEAMS        = 'mode_teams';
export const  MODE_TEAM_MEMBERS = 'mode_team_members';

//
class TeamsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams:             [],
      page:              -1, 
      loading:           false,
      limit:             globalCfg.api.default_page_size,
      can_get_more:      true,
      mode:              props.mode,
      filter:            props.filter,
      job_positions:     props.jobPositions,
      teams_filter:      {}
    };
    // this.handleChange      = this.handleChange.bind(this);
    this.onNewData         = this.onNewData.bind(this);
    this.renderFooter      = this.renderFooter.bind(this); 
    this.getColumnsForType = this.getColumnsForType.bind(this);
    this.applyFilter       = this.applyFilter.bind(this);
    this.refresh           = this.refresh.bind(this);
  }

  getColumnsForType =() =>{

    if(this.state.mode==MODE_TEAMS)
    {
      return columns_helper.columnsForTeams(this.props.callback);  
    }
    return columns_helper.columnsForCrew(this.props.callback, this.props.jobPositions);
  }
  
  
  componentDidMount(){
    if(typeof this.props.onRef==='function')
    {
      this.props.onRef(this);
    }

    this.loadData();
  }
  
  componentWillUnmount() {
    if(typeof this.props.onRef==='function')
      this.props.onRef(undefined)
  }

  applyFilter = (filter) =>{
    console.log(' -- table-widget::applyFilter:', filter)
    this.setState({
      teams_filter:filter
    },() => {
      this.refresh();
    });
  }

  renderFooter(){
    return (<><Button key={'load-more-data_'+this.props.request_type} disabled={!this.state.can_get_more} onClick={()=>this.loadData()}>
                <InjectMessage id="components.TeamsTable.load_more_records" />
              </Button> </>)
  }

  refresh(){
    const that = this;
    this.setState({
      teams:[]
      , can_get_more:true
      , page:-1}
    , ()=>{
      that.loadData();
    })
    return;
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.need_refresh !== prevProps.need_refresh && this.props.need_refresh) {
      this.refresh();
    }
    
    let new_state = {};
    if (this.props.mode !== prevProps.mode) {
      new_state = {...new_state, mode: this.props.mode}
    }
    
    if(prevProps.jobPositions !== this.props.jobPositions) {
      new_state = {...new_state, job_positions: this.props.jobPositions}
    }

    if (this.props.filter !== prevProps.filter) {
      new_state = {...new_state, filter: this.props.filter}
    } 

    if(Object.keys(new_state).length>0)      
      this.setState(new_state);
  }

  loadData = async () =>{

    const {can_get_more, teams_filter, filter}   = this.state;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    const page           = (this.state.page<0)?0:(this.state.page+1);
    const limit          = this.state.limit;
    const that           = this;
    
    const filter_obj = {limit:limit.toString(), page:page.toString(), ...teams_filter, ...(filter||{})};
    console.log(' TEAMS TABLE filter_obj:', filter_obj);
    try{
      const data = await gqlService.loadTeams(filter_obj);
      that.onNewData(data);
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'components.TeamsTable.error_loading'}), e);
      return;
    }
    
  }

  onNewData(teams){
    
    if(!teams || !teams.length) teams = [];
    const _teams          = [...this.state.teams, ...teams];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _teams.length;
    pagination.total      = _teams.length;

    const has_received_new_data = (teams && teams.length>0);

    const {page}   = this.state;
    const the_page = has_received_new_data?(page+1):page;
    this.setState({
      page:           the_page,
      pagination:     pagination, 
      teams:            _teams, 
      can_get_more:   (has_received_new_data && teams.length==this.state.limit), 
      loading:        false
    });

    if(!has_received_new_data)
    {
      const end_of_list           = this.props.intl.formatMessage({id:'components.TeamsTable.end_of_list'})
      const no_records_for_filter = this.props.intl.formatMessage({id:'components.TeamsTable.no_records_for_filter'})
      const msg = (page>0)
        ?end_of_list
        :no_records_for_filter;
      components_helper.notif.infoNotification(msg)
    }
    else
      if(typeof this.props.onChange === 'function') {
        this.props.onChange(this.props.request_type, this.state.txs);
      }
  }

  render(){
    const is_external = (this.state.mode=='external-transfers');
    const header = (is_external)
      ?this.remButtons()
      :(null);
    return (
      <Table 
        title={() => header}
        key={'tx_table__'+this.props.request_type}
        rowKey={record => record._id} 
        loading={this.state.loading} 
        columns={this.getColumnsForType()} 
        dataSource={this.state.teams} 
        footer={() => this.renderFooter()}
        pagination={this.state.pagination}
        scroll={{ x: 950 }}
        onRow={ (record, rowIndex) => {
                  return { 
                    onDoubleClick: event => { this.props.callback(record) }
                  };
            }}
      />
      
    )
  }

}

export default connect(
    (state)=> ({
      jobPositions:       graphqlRedux.jobPositions(state),
      isLoading:          graphqlRedux.isLoading(state),
    }),
    (dispatch)=>({
    })
)( injectIntl(TeamsTable))