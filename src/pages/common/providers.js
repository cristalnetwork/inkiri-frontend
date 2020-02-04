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

import { Card, PageHeader, Button, Table } from 'antd';

import {DISPLAY_ALL_TXS} from '@app/components/TransactionTable';
import * as columns_helper from '@app/components/TransactionTable/columns';

import * as utils from '@app/utils/utils';

import InjectMessage from "@app/components/intl-messages";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl } from "react-intl";
import * as gqlService from '@app/services/inkiriApi/graphql'

import {ResizeableTable} from '@app/components/TransactionTable/resizable_columns';

import ProviderFilter from '@app/components/Filters/provider';


class Providers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :        routesService.breadcrumbForPaths(props.location.pathname),
      loading:        false,
      providers:      [],
      page:           -1, 
      limit:          globalCfg.api.default_page_size,
      can_get_more:   true,
      cursor:         '',
    };

    this.loadProviders               = this.loadProviders.bind(this);  
    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.onButtonClick              = this.onButtonClick.bind(this);
    this.getColumns                 = this.getColumns.bind(this);
    this.onNewProvider               = this.onNewProvider.bind(this); 

    this.filterCallback      = this.filterCallback.bind(this);

    this.myExportRef    = React.createRef();
    this.timeout_id     = null;   
  }

  getColumns(){
    return columns_helper.columnsForProviders(this.onButtonClick); 
  }

  componentDidMount(){
    this.loadProviders(true);  
  } 

  onNewProvider = () => {
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/common/create-provider`
      , state: { 
          referrer: this.props.location.pathname
        }
    })    
  }

  onButtonClick(provider){
    this.props.setLastRootMenuFullpath(this.props.location.pathname);

    this.props.history.push({
      pathname: `/common/provider-profile`
      , state: { 
          provider: provider
          , referrer: this.props.location.pathname
        }
    });
  }

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
        this.reloadProviders();
      } ,100);
      return;
    }
    
    console.log(' iuguFilter: ', JSON.stringify(values));
    /*
      {"state":"state_error","to":"centroinkiri","date_from":"2020-01-02T00:13:52.742Z","date_to":"2020-01-25T00:13:52.742Z"}
    */

    
    clearTimeout(this.timeout_id);
    this.timeout_id = setTimeout(()=> {
      this.setState({filter:(values||{})}, ()=>{
        this.reloadProviders();
      })
    } ,100);
    
  }

  exportButton = () => [<a className="hidden" key="export_button_dummy" ref={this.myExportRef}  href={this.state.sheet_href} target="_blank" >x</a>, <Button key="export_button" onClick={this.handleExportClick} size="small" style={{position: 'absolute', right: '8px', top: '16px'}} title={this.props.intl.formatMessage({id:'global.export_sheet_remember_allowing_popups'})}><FontAwesomeIcon icon="file-excel" size="sm" color="black"/>&nbsp;<InjectMessage id="global.export_list_to_spreadsheet" /></Button>];
  //
  handleExportClick = async () => {

    const filter = this.getFilter(false);
      
    console.log(filter)
    if(!filter)
      return;

    this.setState({loading:true});
    const that       = this;
    try{
      const data = await gqlService.exportProviders(filter);
      
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

  reloadProviders(){
    this.setState({
        page:        -1, 
        providers:    [],
        can_get_more: true,
      }, () => {
        this.loadProviders();
      });  
  }

  getFilter = (increase_page_if_needed) => {
    const page             = (this.state.page<=0)
      ?0
      :(increase_page_if_needed)
        ?(this.state.page+1)
        :this.state.page;

    const {limit, filter}  = this.state;
    
    return {limit:limit.toString(), page:page.toString(), ...filter};
  }

  loadProviders = async (first) => {

    let can_get_more   = this.state.can_get_more;
    if(!can_get_more && this.state.page>=0)
    {
      components_helper.notif.infoNotification(this.props.intl.formatMessage({id:'pages.common.providers.cant_get_more_end_of_list'}));
      this.setState({loading:false});
      return;
    }

    this.setState({loading:true});

    let that     = this;
    const filter = this.getFilter(true);
    try{
      const data = await gqlService.providers(filter);
      console.log(' ==== providers::gqlService:', data)
      that.onNewData(data);
    }
    catch(e)
    {
      this.setState({loading:false});
      components_helper.notif.exceptionNotification(this.props.intl.formatMessage({id:'pages.common.providers.error_loading_providers'}), e);
    }

    this.setState({loading:false});
  }

  onNewData(providers){
    
    if(!providers)
      providers=[];
    const _providers      = [...this.state.providers, ...providers];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _providers.length;
    pagination.total      = _providers.length;

    const has_received_new_data = (providers && providers.length>0);
    const {page} = this.state.page;

    this.setState({pagination:pagination
                    , providers:_providers
                    // , can_get_more:(has_received_new_data && providers.length==this.state.limit)
                    , can_get_more:has_received_new_data 
                    , page:has_received_new_data?(page+1):page
                    , loading:false})

    if(!has_received_new_data)
    {
      const end_of_list           = this.props.intl.formatMessage({id:'pages.common.providers.end_of_list'})
      const no_records_for_filter = this.props.intl.formatMessage({id:'pages.common.providers.no_records_for_filter'})
      const msg = (page>0)
        ?end_of_list
        :no_records_for_filter;
      components_helper.notif.infoNotification(msg)
    }
    
  }

  // Component Events
  

  
  renderFooter(){
    return (<Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProviders()}>
        { this.props.intl.formatMessage({id:'pages.common.providers.load_more_records'}) }
      </Button>)
  }

  //
  
  
  render() {
    const {routes, loading}   = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          extra={[
            <Button size="small" key="refresh" icon="redo" disabled={loading} onClick={()=>this.reloadProviders()} ></Button>,
            <Button key="_new_provider" size="small" type="primary" icon="plus" onClick={()=>{this.onNewProvider()}}> 
              { this.props.intl.formatMessage({id:'pages.common.providers.new_provider_button_text'}) }
            </Button>,
          ]}
          title={ this.props.intl.formatMessage({id:'pages.common.providers.title'}) }
        />
          
        <div className="styles standardList" style={{ marginTop: 24 }}>
          <Card
            className="styles listCard"
            bordered={false}
            title={ this.props.intl.formatMessage({id:'pages.common.providers.table_title'}) }
            style={{ marginTop: 24 }}
          >
            <ProviderFilter 
              callback={this.filterCallback} />

            <ResizeableTable
              title = { () => this.exportButton() }
              key="table_all_txs" 
              rowKey={record => record._id} 
              loading={this.state.loading} 
              columns_def={this.getColumns()} 
              dataSource={this.state.providers} 
              footer={() => this.renderFooter()}
              pagination={this.state.pagination}
              scroll={{ x: 700 }}
              />

          </Card>
        </div>
      </>
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
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(injectIntl(Providers)))
);