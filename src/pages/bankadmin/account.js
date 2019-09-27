import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as routesService from '@app/services/routes';
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import _ from 'lodash';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Badge, Skeleton, List, Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Descriptions } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import styles from './account.less';

const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('accounts');

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:         true,
      permissioned:    '',
      dataSource:      [],
      pushingTx:       false,
      
      active_tab_key:  'owner',
      new_perm_name:   '',
      delete_permission:undefined,
      result:          undefined,
      result_object:   undefined,
      error:           {},
      
      account : undefined
      , account_balance : '?.??'
      , eos_account : undefined
      
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderAccountInfo          = this.renderAccountInfo.bind(this);
    this.loadAccountInfo            = this.loadAccountInfo.bind(this);
    this.addPermission              = this.addPermission.bind(this);
    this.renderPerm                 = this.renderPerm.bind(this);
    this.renderAllPerms             = this.renderAllPerms.bind(this);
    this.renderPermContent          = this.renderPermContent.bind(this);
    this.onTabChange                = this.onTabChange.bind(this);

    this.onCancelNewPermission      = this.onCancelNewPermission.bind(this);
    this.onNewPermission            = this.onNewPermission.bind(this);
    this.onDeletePermission         = this.onDeletePermission.bind(this);
    this.deletePermission           = this.deletePermission.bind(this);
  }

  static propTypes = {
    // match: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired
    match: PropTypes.object,
    location: PropTypes.object,
    history: PropTypes.object
  };

  componentDidMount(){
    const { match, location, history } = this.props;
    if(this.props.location && this.props.location.state)
    {  
      this.setState({account : this.props.location.state.account})
      if(this.props.location.state.account && this.props.location.state.account.key)
      {
        this.loadAccountInfo(this.props.location.state.account.key);
      }
    }

  }
  
  loadAccountInfo = async (account_name) => {
    
    // const { balance } = await api.getAccountBalance(account_name);
    // const { perm } = await api.getAccount(account_name);
    if(!account_name)
      account_name = account_name | this.state.eos_account.account_name;
    var promise1 = api.getAccountBalance(account_name);
    var promise2 = api.getAccount(account_name);
  
    Promise.all([promise1, promise2])
      .then((values) => {
        // console.log(' ************ page::account::fetching balance and perms >> ', JSON.stringify(values));
        let balance = values[0];
        let perm    = values[1];
        // console.log(' balance >> ' , account_name, JSON.stringify(balance))
        console.log(' loadAccountInfo >> perm >> ' , JSON.stringify(perm))    
        this.setState({loading:false, account_balance: parseFloat(balance.data.balance).toFixed(2)
                        , eos_account: perm.data})
      }, (err)=>{
        // console.log(' ************ page::account::fetching balance and perms >> ', JSON.stringify(err));
        this.setState({loading:false
          , result: 'error'
          , error: {
                      title:'Error loading blockchain permissions and balance.'
                      , content:JSON.stringify(err)
                    }
          , loading: false})
      });

  }


  /* ****************
   * EVENTS
  */

  onSelect(value) {
    console.log('onSelect', value);
    this.setState({permissioned:value})
  }

  onTabChange = (tabKey) => {
    this.setState({
      active_tab_key: tabKey,
    });
  }

  // onSearch={this.handleSearch}
  handleSearch(value){
    // this.setState({
    //   dataSource: !value ? [] : [value, value + value, value + value + value],
    // });
  };

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  //
  handleSubmit = e => {

    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        //
        return;
      }
      console.log(' >> addPermission ?? >>', JSON.stringify(values), ' | new_perm_name >> ', this.state.new_perm_name)
      this.addPermission(values.permissioned, this.state.new_perm_name);
    });
    
  };

  onNewPermission(perm_name){
    this.setState({result:'new_perm', new_perm_name:perm_name})
  }

  onDeletePermission(perm_name, actor, permission){
    console.log(' >> onDeletePermission >> ', perm_name, actor, permission)
    this.setState({result:'delete_perm', delete_permission:{
      perm_name: perm_name, 
      actor: actor, 
      permission: permission
    }})
  }

  onCancelNewPermission(){
    // this.setState({result:'', new_perm_name:''})
    this.resetPage();
  }


  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  backToAccounts = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/accounts`
    })
  }

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}, new_perm_name:''});
    this.loadAccountInfo(this.state.eos_account.account_name);
  }

  
  
  /* **************
  * Main functions
  *
  */
  addPermission = async (permissioned, perm_name) => {
    
    const {eos_account}  = this.state;
    const new_perm       = api.getNewPermissionObj (eos_account, permissioned, perm_name)
    this.setAccountPermission(perm_name, new_perm);
  }

  deletePermission = async (perm_name, actor, permission) => {
    
    console.log(' >> deletePermission >> ', perm_name, actor, permission)
    const {eos_account}  = this.state;
    
    let the_perm = eos_account.permissions.filter( perm => perm.perm_name==perm_name )[0]
    console.log(' >> deletePermission >>', JSON.stringify(the_perm))
    _.remove(the_perm.required_auth.accounts, function(e) {
      return e.permission.actor === actor && e.permission.permission === permission;
    });
    
    console.log(' >> deletePermission >>',JSON.stringify(the_perm));
    
    this.setAccountPermission(perm_name, the_perm.required_auth);
    
  }

  setAccountPermission(perm_name, new_perm){
    const {eos_account}  = this.state;
    const that = this;
    that.setState({pushingTx:true});
    api.setAccountPermission(eos_account.account_name, this.props.actualPrivateKey, perm_name, new_perm)
      .then(data => {
        console.log(' ### setAccountPermission >>> ', JSON.stringify(data))
        that.setState({result:'ok', pushingTx:false, result_object:data});
      }, (ex)=>{
        console.log( ' ### setAccountPermission >>> ERROR >> ', JSON.stringify(ex))
        that.setState({pushingTx:false, result:'error', error:JSON.stringify(ex)});
      });
  }

  /* ****************
   * Render Functions
  */
  renderContent() {
  
    const { getFieldDecorator }     = this.props.form;
    const { result, result_object } = this.state;
    
    if(result=='new_perm')
    {
      const {active_tab_key, eos_account} = this.state;
      const { account_name } = eos_account;
      return (
        <Card 
          title={(<span>New Permission for <strong>{utils.capitalize(active_tab_key)} </strong> </span> )}
          key={'new_perm'}
          style = { { marginBottom: 24 } } 
          extra = {<Button key="_new_perm_cancel" icon="close" onClick={() => this.onCancelNewPermission()}> Cancel</Button>}
          >
          <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>

            <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
              <Form onSubmit={this.handleSubmit}>
                  
                <Form.Item style={{minHeight:60, marginBottom:12}}>
                  {getFieldDecorator('permissioned', {
                    rules: [{ required: true, message: 'Please input account name!' }]
                  })(
                    <AutoComplete
                      autoFocus
                      size="large"
                      dataSource={this.props.accounts.filter(acc=>acc.key!=account_name).map(acc=>acc.key)}
                      style={{ width: '100%' }}
                      onSelect={this.onSelect}
                      placeholder=""
                      filterOption={true}
                      className="extra-large"
                    >
                      <Input suffix={<Icon type="user" style={{fontSize:20}} className="default-icon" />} />
                    </AutoComplete>
                     
                  )}
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" className="login-form-button">
                    Authorize
                  </Button>
                  
                </Form.Item>
              </Form>
            </Spin>
          
          </div>
        </Card>
      ); 
    }
    if(result=='ok')
    {
      const tx_id = api.dfuse.getTxId(result_object?result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
            status="success"
            title="Transaction completed successfully!"
            subTitle={"Transaction id "+tx_id+". Cloud server takes up to 30 seconds, please wait."}
            extra={[
              <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                Go to dashboard
              </Button>,
              <Button  key="go-to-accounts" onClick={()=>this.backToAccount()}>
                Back to Accounts
              </Button>,
              <Button shape="circle" icon="close" key="close" onClick={()=>this.resetPage()} />,
              <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>,
              
            ]}
          />
        </div>)
    }

    //
    if(result=='delete_perm')
    {
      const {perm_name, actor, permission} = this.state.delete_permission;
      console.log(' >> onRenderContent >> ', perm_name, actor, permission)
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
                title='Please confirm permission deletion'
                subTitle={'Delete '+actor+'@'+permission+ ' from ' +  utils.capitalize(perm_name)}
                extra={[
                  <Button type="primary" key="confirm-delete" onClick={()=>this.deletePermission(perm_name, actor, permission)}>Confirm Delete</Button>,
                  <Button icon="close" key="close" onClick={()=>this.resetPage()} >Cancel</Button>
                ]}
              >
              </Result>
        </div>)
    }

    if(result=='error')
    {
      const {title, content} = this.state.error;
      // <Button key="re-send">Try sending again</Button>,
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
                status="error"
                title={title}
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>Go to dashboard</Button>,
                  <Button shape="circle" icon="close" key="close" onClick={()=>this.resetPage()} />
                ]}
              >
                <div className="desc">
                  <Paragraph>
                    <Text
                      strong
                      style={{ fontSize: 16, }}
                    >
                      The content you submitted has the following error:
                    </Text>
                  </Paragraph>
                  <Paragraph>
                    <Icon style={{ color: 'red' }} type="close-circle" /> {title}
                  </Paragraph>
                </div>
              </Result>
        </div>)
    }
    
    // ** hack for sublime renderer ** //
    /*
      <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
        <Form onSubmit={this.handleSubmit}>
        </Form>
      </Spin>
    */
    if(!this.state.account)
      return(null);

    // (<div style={{ margin: '24px 0', padding: 0, background: '#fff'}}></div>)

    const {account_type} = this.state.account;
    const permConf = globalCfg.bank.listPermsByAccountType();
    
    const xx = this.renderAllPerms(permConf[account_type]);
    return <>{xx}</>;

  }
  
  //
  

  renderAllPerms(perms) {
    if(!this.state.eos_account)
      return(null);

    const { active_tab_key } = this.state;
    
    return (
      <Card 
        key={'card_master'}
        style = { { marginBottom: 24 } } 
        extra = {<Button key="_new_perm" size="small" icon="plus" onClick={() => this.onNewPermission(active_tab_key)}> New</Button>}
        tabList={perms.map(perm=>{
          return {key: perm
                  , tab: (
                    <span>{utils.capitalize(perm)}</span>
                  )}
  
        })}
        activeTabKey={active_tab_key}
        onTabChange={this.onTabChange}
  
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
          {this.renderPermContent(active_tab_key)}        
        </div>
      </Card>
    );
  }
  //

  renderPermContent(perm_name) {
    if(!this.state.eos_account)
      return(null);

    const { eos_account, loading } = this.state;
    let perm = eos_account.permissions.filter( perm => perm.perm_name==perm_name )
    let list = [];
    if(perm && perm.length>0)
      list = perm[0].required_auth.accounts.filter(acc => acc.permission.actor.trim()!=eos_account.account_name.trim());
    
    return (
          
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[<a  key={"delete-"+item.permission.actor+item.permission.permission} 
                              onClick={() => this.onDeletePermission(perm_name, item.permission.actor, item.permission.permission )}
                            disabled={item.permission.actor==globalCfg.bank.issuer}>DELETE</a>]}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      <span className="ant-avatar"><Icon style={{fontSize:24, color: 'rgba(0, 0, 0, 0.65)' }} type="key" /> </span>
                    }
                    title={<a href="#">{item.permission.actor}</a>}
                    description={'@'+item.permission.permission}
                  />
                  <div></div>
                </Skeleton>
              </List.Item>
            )}
          />
    
    );
  }

  renderPerm(perm_name) {
    if(!this.state.eos_account)
      return(null);

    const { eos_account, loading } = this.state;
    let perm = eos_account.permissions.filter( perm => perm.perm_name==perm_name )
    let list = [];
    if(perm && perm.length>0)
      list = perm[0].required_auth.accounts.filter(acc => acc.permission.actor.trim()!=eos_account.account_name.trim());
    //<Icon type="user" />
    // console.log(' >> reduced perm_name >> ', perm_name,JSON.stringify(list))
    return (
      <Card 
        key={'card_'+perm_name}
        title = { utils.capitalize(perm_name) + " Permissions" }  
        style = { { marginBottom: 24 } } 
        extra = {<a key={'new_'+perm_name} href="#">+ New</a>}
        >
        <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
          
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[<a key={"delete-"+item.permission.actor+item.permission.permission}>DELETE</a>]}
              >
                <Skeleton avatar title={false} loading={item.loading} active>
                  <List.Item.Meta
                    avatar={
                      <span className="ant-avatar"><Icon style={{fontSize:24, color: 'rgba(0, 0, 0, 0.65)' }} type="key" /> </span>
                    }
                    title={<a href="#">{item.permission.actor}</a>}
                    description={'@'+item.permission.permission}
                  />
                  <div></div>
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      </Card>
    );
  }

  // ** hack for sublime renderer ** //
  renderAccountInfo() 
  {
    if(!this.state.account)
      return (<></>);
    const {key, fee, overdraft, account_type, state_description, account_type_description} = this.state.account;
    // console.log(this.state.account)
    const email = '';
    const fullname = key;
    const account_name = key;
    let _href='#';
    if(this.state.account)
      _href = api.dfuse.getBlockExplorerAccountLink(account_name);
    let viewOnBlockchain = (<Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>)

    return (<Descriptions className="headerList" size="small" column={2}>
      <Descriptions.Item  label = " Account Name " > <b>{account_name}</b> </ Descriptions.Item >
      <Descriptions.Item  label = " Full Name " > {fullname} </ Descriptions.Item >
      <Descriptions.Item  label = " Email " >{email}</ Descriptions.Item >
      <Descriptions.Item  label = " Created at " >N/A</ Descriptions.Item >
      <Descriptions.Item  label = " Fee " >{globalCfg.currency.toCurrencyString(fee)}</ Descriptions.Item >
      <Descriptions.Item  label = " Associated Documents " > 
        <a href="#"><i>nothing yet</i></a>
      </Descriptions.Item>
      <Descriptions.Item  label = " Overdraft " >{globalCfg.currency.toCurrencyString(overdraft)}</ Descriptions.Item >
      <Descriptions.Item  label = " Status " >{(state_description|'')}</ Descriptions.Item >
      <Descriptions.Item  label = " Account Type " >{(account_type_description|'')}</ Descriptions.Item >
      <Descriptions.Item  label = " Blockchain Link" >
        {viewOnBlockchain}
      </ Descriptions.Item >
    </Descriptions>);

  }  
  // ** hack for sublime renderer ** //

  renderExtraContent ()
  {
    const balance = this.state.account_balance;
    return(
      <Row>
        <Col xs={24} sm={24}>
          <div className ="textSecondary" > Account Balance ({globalCfg.currency.symbol}) </div>
          <div className ="heading" >{balance}</div>
        </Col>
      </Row>
    );
  }

  //
  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          style={{marginBottom:'24px'}}
          breadcrumb={{ routes }}
          title="Account details"
          subTitle="View and modifiy account profile and permissions"
          
        >
         
         <div className="wrap">
            <div className="content padding">{this.renderAccountInfo()}</div>
            <div className="extraContent">{this.renderExtraContent()}</div>
          </div>

        </PageHeader>
        
           
          {content}

        
      </>
    );
  }
  
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccount:    loginRedux.actualAccount(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(Account) )
);
