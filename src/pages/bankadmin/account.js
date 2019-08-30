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

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin, Descriptions } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import './processRequest.css'; 
import styles from './processRequest.less';

const { Paragraph, Text } = Typography;


const Description = ({ term, children, span = 12 }) => (
    <Col span={span}>
      <div className="description">
        <div className="term">{term}</div>
        <div className="detail">{children}</div>
      </div>
    </Col>
  );

const routes = routesService.breadcrumbForFile('accounts');

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      true,
      dataSource:   [],
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      result:       undefined,
      
      result_object:undefined,
      error:        {},
      
      number_validateStatus : '',
      number_help:  ''

      , account : undefined
      , account_balance : '?.??'
      , eos_account : undefined
      
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onChange                   = this.onChange.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderAccountInfo          = this.renderAccountInfo.bind(this);
    this.loadAccountInfo            = this.loadAccountInfo.bind(this);
    this.changePermissions          = this.changePermissions.bind(this);
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

    var promise1 = api.getAccountBalance(account_name);
    var promise2 = api.getAccount(account_name);
  
    Promise.all([promise1, promise2])
      .then((values) => {
        console.log(' ************ page::account::fetching balance and perms >> ', JSON.stringify(values));
        let balance = values[0];
        let perm    = values[1];
        console.log(' balance >> ' , account_name, JSON.stringify(balance))
        console.log(' perm >> ' , JSON.stringify(perm))    
        this.setState({loading:false, account_balance: parseFloat(balance.balance).toFixed(2)
                        , eos_account: perm.data})
      }, (err)=>{
        console.log(' ************ page::account::fetching balance and perms >> ', JSON.stringify(err));
        this.setState({loading:false
          , result: 'error'
          , error: {
                      title:'Error loading blockchain permissions and balance.'
                      , content:JSON.stringify(err)
                    }
          , loading: false})
      });

  }
  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  onChange(e) {
    e.preventDefault();
    // console.log('changed', e);
    this.setState({amount:e.target.value, number_validateStatus:'' , number_help:''})
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

  changePermissions = async () => {
    
    // that.setState({pushingTx:true});
    // api.changePermissions(sender, privateKey, receiver, amount, memo)
    //   .then(data => {
    //     that.setState({pushingTx:false, result:'error', error:'error'});
    //   }, (ex)=>{
    //     that.setState({pushingTx:false, result:'error', error:JSON.stringify(ex)});
    //   });
  }


  handleSubmit = e => {
    e.preventDefault();
    this.changePermissions();
  };

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/extrato`
    })
  }

  backToAccounts = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/accounts`
    })
  }

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}});
  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    if(this.state.result=='ok')
    {
      const tx_id = api.dfuse.getTxId(this.state.result_object?this.state.result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      return (<Result
        status="success"
        title="Transaction completed successfully!"
        subTitle="Transaction id ${tx_id}. Cloud server takes up to 30 seconds, please wait."
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button  key="go-to-accounts" onClick={()=>this.backToAccount()}>
            Back to Accounts
          </Button>,
          <Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>,
          
        ]}
      />)
    }

    if(this.state.result=='error')
    {
      const {title, content} = this.state.error;
      // <Button key="re-send">Try sending again</Button>,
      return (<Result
                status="error"
                title={title}
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>Go to dashboard</Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetPage()} />
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
              </Result>)
    }
    
    // ** hack for sublime renderer ** //

    
    return (
        <div style={{ margin: '0 auto', width:500, padding: 24, background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form onSubmit={this.handleSubmit}>
                

            </Form>
          </Spin>
        </div>
    );
  }
  
  // ** hack for sublime renderer ** //
  renderAccountInfo() 
  {
    if(!this.state.account)
      return (<></>);
    const {key, fee, overdraft, account_type, state_description, account_type_description} = this.state.account;
    console.log(this.state.account)
    const email = '';
    const fullname = key;
    const account_name = key;
    let _href='#';
    if(this.state.account)
      _href = api.dfuse.getBlockExplorerAccountLink(account_name);
    let viewOnBlockchain = (<Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" >View on Blockchain</Button>)

    return (<Descriptions className="headerList" size="small" column={2}>
      <Descriptions.Item  label = " Acocunt Name " > {account_name} </ Descriptions.Item >
      <Descriptions.Item  label = " Full Name " > {fullname} </ Descriptions.Item >
      <Descriptions.Item  label = " Email " >{email}</ Descriptions.Item >
      <Descriptions.Item  label = " Created at " >N/A</ Descriptions.Item >
      <Descriptions.Item  label = " Fee " >{parseFloat(fee).toFixed(2)}</ Descriptions.Item >
      <Descriptions.Item  label = " Associated Documents " > 
        <a href="#"><i>nothing yet</i></a>
      </Descriptions.Item>
      <Descriptions.Item  label = " Overdraft " >{parseFloat(overdraft).toFixed(2)}</ Descriptions.Item >
      <Descriptions.Item  label = " Status " >{(state_description|'')}</ Descriptions.Item >
      <Descriptions.Item  label = " Account Type " >{(account_type_description|'')}</ Descriptions.Item >
      <Descriptions.Item  label = " Blockchain Link" >
        {viewOnBlockchain}
      </ Descriptions.Item >
    </Descriptions>);

    // const current_stats = this.currentStats();
    // return (
    //   <Row>
    //     <Description term="Entradas"><Tag color="green">IK$ {current_stats.money_in.toFixed(2)}</Tag></Description>
    //     <Description term="Variacao de caja"><Tag color="red">IK$ {(current_stats.money_in - current_stats.money_out).toFixed(2)}</Tag></Description>
    //     <Description term="Saidas"><Tag color="red">-IK$ {current_stats.money_out.toFixed(2)}</Tag></Description>
    //     <Description term="Lancamentos">{current_stats.count|0}</Description>
    //   </Row>
    // );
  }  
  // ** hack for sublime renderer ** //

  renderExtraContent ()
  {
    const {balance} = this.state.account_balance;
    return(
      <Row>
        
        <Col xs={24} sm={24}>
          <div className ="textSecondary" > Account Balance (IK$) </div>
          <div className ="heading" >{balance}</div>
        </Col>
      </Row>
    );
  }

  render() {
    let content = this.renderContent();
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
          title="Account details"
          subTitle="View and modifiy account profile and permissions"
          
        >
         
         <div className="wrap">
            <div className="content padding">{this.renderAccountInfo()}</div>
            <div className="extraContent">{this.renderExtraContent()}</div>
          </div>

        </PageHeader>

        <div style={{ margin: '24px 0', padding: 0, background: '#fff'}}>
           < Card  title = " Account Permissions "  style = { { marginBottom: 24 } } >
          {content}
          </Card>
        </div>
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
