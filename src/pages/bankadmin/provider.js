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
import { Table, notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

// import styles from './account.less';
import styles from './style.less';
import './pda.css'; 

import {columns,  DISPLAY_PROVIDER } from '@app/components/TransactionTable';

import {formItemLayout,tailFormItemLayout } from '@app/utils/utils';

const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('providers');



class Provider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updating:        false,
      pushingTx:       false,
      
      loading:         false,
      txs:             [],
      page:            -1, 
      limit:           globalCfg.api.default_page_size,
      can_get_more:    true,
      
      result:          undefined,
      result_object:   undefined,
      error:           {},
      
      provider : undefined
      
    };

    this.renderFooter               = this.renderFooter.bind(this); 
    this.onNewData                  = this.onNewData.bind(this);
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetPage                  = this.resetPage.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderProviderInfo         = this.renderProviderInfo.bind(this);
    this.onUpdateProvider           = this.onUpdateProvider.bind(this);
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
    if(this.props.location && this.props.location.state && this.props.location.state.provider)
    {  
      // this.setState({provider : this.props.location.state.provider})

      this.setState(
          {provider : this.props.location.state.provider}
      , () => {
          this.loadProviderTxs(true);
      });
    }
    else
    {
      // DEMO DATA!
      // this.setState({provider : {"address":{"street":"Rua do Rey 1115","city":"Rio de Janeiro","state":"Rio de Janeiro","zip":"111222","country":"Brazil"},"_id":"5d8cba5b494b1a316b854d7c","name":"Proveedor #1","cnpj":"123456789","email":"proveedor1@gmail.com","phone":"+025369875","category":"Proveedor de conocimiento","products_services":"Conocimientos, ideas, y eso","bank_accounts":[{"_id":"5d8cba5b494b1a316b854d7d","bank_name":"Banco do Brasil","agency":"1234","cc":"987654321"}],"created_by":{"self_created":true,"_id":"5d67d2c78ed5673269c0a54c","account_name":"inkirimaster","email":"inkirimaster@inkiri.com","created_at":"2019-08-29T13:27:35.198Z","updatedAt":"2019-09-26T21:14:41.203Z","userCounterId":10,"__v":0,"to_sign":"5HvyTXD98nATUv1PfNg3xjPrZvww5DX7eh21kjPSm836hVGNb4Y","_type":"personal","account_type":"personal","id":"5d67d2c78ed5673269c0a54c"},"created_at":"2019-09-26T13:17:15.630Z","updatedAt":"2019-09-26T13:17:15.630Z","providerCounterId":1,"__v":0,"id":"5d8cba5b494b1a316b854d7c"} });
    }

  }
  
  loadProviderTxs = async (first_call) => {
    let can_get_more   = this.state.can_get_more;
    if(!can_get_more)
    {
      this.setState({loading:false});
      return;
    }

    
    this.setState({loading:true});

    let page                = (this.state.page<0)?0:(this.state.page+1);
    const {limit, provider} = this.state;
    let that                = this;
    
    // const req_type = DISPLAY_PROVIDER;
    
    api.bank.listRequestsForProvider(page, limit, provider.id)
    .then( (res) => {
        that.onNewData(res, first_call);
      } ,(ex) => {
        // console.log('---- ERROR:', JSON.stringify(ex));
        that.setState({loading:false});  
      } 
    );
  }

  onNewData(txs, first_call){
    
    const _txs            = [...this.state.txs, ...txs];
    const pagination      = {...this.state.pagination};
    pagination.pageSize   = _txs.length;
    pagination.total      = _txs.length;

    const has_received_new_data = (txs && txs.length>0);

    this.setState({pagination:pagination, txs:_txs, can_get_more:(has_received_new_data && txs.length==this.state.limit), loading:false})

    if(!has_received_new_data && !first_call)
    {
      this.openNotificationWithIcon("info", "End of transactions","You have reached the end of transaction list!")
    }
    // else
    //   this.computeStats();
  }

  /* ****************
   * EVENTS
  */

  onUpdateProvider(){
    const {updating, provider}=this.state;
    // this.setState({updating:!updating});
    const provider_update = Object.assign({}, provider);
    this.setState({updating:true, provider_update:provider_update});
  }

  cancelUpdating(){
    this.setState({updating:false});
  }

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
        this.openNotificationWithIcon("warning", "Please check fields notifications!","")  
        return;
      }
      console.log('Received values of form: ', values);

      this.setState({provider_update:values, result:'should-confirm'});
      // this.setState({result:'should-confirm'});
    });
  };
  
  doUpdateProvider(){
    const {id} = this.state.provider;
    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = this.state.provider_update;
    // guarda
    api.bank.createOrUpdateProvider(id, name, cnpj, email, phone, address, category, products_services, bank_accounts)
    .then((res)=>{
      console.log(' >> doUpdateProvider >> ', JSON.stringify(res));
      this.setState({result:'ok'});
    }, (err)=>{
      this.setState({result:'error', error:err});
    })
    

  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  backToProviders = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/providers`
    })
  }

  resetPage(){
    this.setState({result: undefined, result_object: undefined, error: {}});
  }

  
  
  /* **************
  * Main functions
  *
  */
  /* ****************
   * Render Functions
  */
  renderConfirmUpdate(){
    const {name, cnpj, email, phone, category, products_services, bank_accounts}      = this.state.provider_update;
    const bank_account = bank_accounts[0];

    return (<Result
      icon={<Icon type="question-circle" theme="twoTone" />}
      title={`Please confirm provider update`} 
      subTitle={(<span> Name: {name}<br/> 
                  CNPJ: {cnpj}<br/>
                  Email: {email}<br/>
                  Phone: {phone}<br/> 
                  Category: {category}<br/>
                  Products/Services: {products_services}<br/>
                  Bank Account: {bank_account.bank_name}, {bank_account.agency}, {bank_account.cc} </span>)}
      extra={[<Button key="do_update_provider" type="primary" onClick={() => {this.doUpdateProvider()} }>Confirm Update Provider</Button>,
              <Button key="cancel" onClick={() => {this.resetPage()} }>Cancel</Button>]}/>)
  }

  renderFooter(){
    return (<><Button key="load-more-data" disabled={!this.state.can_get_more} onClick={()=>this.loadProviderTxs()}>More!!</Button> </>)
  }
  renderContent() {
  
    if(this.state.result=='should-confirm'){
      const confirm = this.renderConfirmUpdate();
      return(
        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
          {confirm}
        </div>);
    }
    //
    const { updating, result, result_object } = this.state;
    
    if(result=='ok')
    {
      return (
        <div style={{ margin: '0 0px', padding: 24, background: '#fff'}}>
          <Result
            status="success"
            title="Transaction completed successfully!"
            subTitle={"Updates may take up to 30 seconds, please wait."}
            extra={[
              <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                Go to dashboard
              </Button>,
              <Button  key="go-to-providers" onClick={()=>this.backToProviders()}>
                Back to Providers
              </Button>,
              <Button shape="circle" icon="close" key="close" onClick={()=>this.resetPage()} />,
            ]}
          />
        </div>)
    }
    
    //
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
    
    if(updating)
      return this.renderForm();

    return (<Table
            key="table_all_requests" 
            rowKey={record => record.id} 
            loading={this.state.loading} 
            columns={columns()} 
            dataSource={this.state.txs} 
            footer={() => this.renderFooter()}
            pagination={this.state.pagination}
            scroll={{ x: 700 }}
            />);
  }
  
  // ** hack for sublime renderer ** //
  renderProviderInfo() 
  {
    if(!this.state.provider)
      return (<></>);

    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = this.state.provider;
    
    return (<Descriptions className="headerList" size="small" column={2}>
      <Descriptions.Item  label="Name" > <b>{name}</b> </ Descriptions.Item >
      <Descriptions.Item  label="CNPJ" > {cnpj} </ Descriptions.Item >
      <Descriptions.Item  label="Contact" >
        <span>
         <Icon type="mail" />&nbsp;{email}
        </span><br/>
        <span> 
          <Icon type="phone" />&nbsp;{phone}
        </span>
      </ Descriptions.Item >
      <Descriptions.Item  label="Address" >
        <Icon type="environment" /> {address.street}, {address.city}, CP {address.zip}, {address.state}, {address.country}
      </ Descriptions.Item >
      <Descriptions.Item  label="Category" >{category}</ Descriptions.Item >
      <Descriptions.Item  label="Products/Services" >{products_services}</ Descriptions.Item >
      <Descriptions.Item  label="Bank Account" >
        <Icon type="bank" /> {bank_accounts.map(bank_account => <span key={'bank_accounts'+bank_account._id}>{bank_account.bank_name}, {bank_account.agency}, {bank_account.cc}</span>)} 
      </ Descriptions.Item >
    </Descriptions>);

  }  
  //
  renderForm(){
    
    const {provider_update} = this.state;
    if(!provider_update)
      return (<></>);
    //
    const { getFieldDecorator } = this.props.form;
    const {name, cnpj, email, phone, address, category, products_services, bank_accounts} = provider_update;
    const {pushingTx} = this.state;
    return (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              
              <Form.Item
                label="Nome"
                >
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: 'Please input provider name!', whitespace: true }],
                    initialValue: name
                  })(<Input />)}
                </Form.Item>

                <Form.Item
                  label="CNPJ"
                >
                  {getFieldDecorator('cnpj', {
                    rules: [{ required: true, message: 'Please input CNPJ!', whitespace: true }],
                    initialValue: cnpj
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="E-mail">
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                      },
                      {
                        required: true,
                        message: 'Please input E-mail!',
                      },
                    ],
                    initialValue: email
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Phone Number">
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, message: 'Please input phone number!' }],
                    initialValue: phone
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                
                <h3 className="fileds_header">ADDRESS</h3>
                <Form.Item label="Street" extra="Street and Number, Apt, Suite, Unit, Building">
                  {getFieldDecorator('address.street', {
                    rules: [{ required: true, message: 'Please input Street!' }],
                    initialValue: address.street
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="City">
                  {getFieldDecorator('address.city', {
                    rules: [{ required: true, message: 'Please input City!' }],
                    initialValue: address.city
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="State/Province">
                  {getFieldDecorator('address.state', {
                    rules: [{ required: true, message: 'Please input State/Province!' }],
                    initialValue: address.state
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Zip / Postal Code">
                  {getFieldDecorator('address.zip', {
                    rules: [{ required: true, message: 'Please input Zip/Postal code!' }],
                    initialValue: address.zip
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Country">
                  {getFieldDecorator('address.country', {
                    rules: [{ required: true, message: 'Please input State/Province!' }],
                    initialValue: address.country
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <h3 className="fileds_header">BANK ACCOUNT</h3>
                <Form.Item label="Bank Name">
                  {getFieldDecorator('bank_accounts[0].bank_name', {
                    rules: [{ required: true, message: 'Please input Bank Name!' }],
                    initialValue: bank_accounts[0].bank_name
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Agency">
                  {getFieldDecorator('bank_accounts[0].agency', {
                    rules: [{ required: true, message: 'Please input Agency!' }],
                    initialValue: bank_accounts[0].agency
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="CC">
                  {getFieldDecorator('bank_accounts[0].cc', {
                    rules: [{ required: true, message: 'Please input CC!' }],
                    initialValue: bank_accounts[0].cc
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                      Update Provider
                    </Button>
                     <Button style={{ marginLeft: 8 }} onClick={() => this.cancelUpdating() }>
                      Cancel
                    </Button>
                  </Form.Item>
            </Form>  
          </Spin>
        </div>
    );
  }

  //
  render() {
    const {provider} = this.state;

    const content      = this.renderContent();

    let title        = "Provider profile";
    let subTitle     = "View and modifiy provider profile and transactions"
    if(provider)
    {
      title = provider.name;
      subTitle = ""
    }

    return (
      <>
        <PageHeader
          style={{marginBottom:'24px'}}
          breadcrumb={{ routes }}
          title={title}
          subTitle={subTitle}
          
          extra={[
            <Button key="_update_provider" icon="edit" onClick={()=>{this.onUpdateProvider()}}> Update Provider</Button>,
          ]}
        >
         
         <div className="wrap">
            <div className="content padding">{this.renderProviderInfo()}</div>
          </div>

        </PageHeader>
        
        <Card key={'_provider'}
            style = { { marginBottom: 24, marginTop: 24 } } 
            loading={this.state.pushingTx}
            >
          {content}
        </Card>
        
      </>
    );
  }
  
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:         accountsRedux.accounts(state),
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:       loginRedux.actualRole(state),
        actualPrivateKey: loginRedux.actualPrivateKey(state),
        isLoading:        loginRedux.isLoading(state),
        balance:          balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        
    })
)(Provider) )
);
