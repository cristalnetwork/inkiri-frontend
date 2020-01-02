import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import {formItemLayout,tailFormItemLayout } from '@app/utils/utils';

const { Paragraph, Text } = Typography;

const DEFAULT_PROVIDER = {
  name:        '',
  cnpj:        '',
  email:            '',
  phone:            '',
  address:          { 
                      street:  '', 
                      city:    '', 
                      state:   '', 
                      zip:     '', 
                      country: ''
                    },
  category:    '',
  products_services:    '',
  bank_account:     {  
                      bank_name:    '',
                      agency:    '',
                      cc:    ''
                    }
};

class CreateProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:      true,
      pushingTx:    false,
      
      result:       undefined,
      result_object:undefined,
      error:        {},
      
      provider:{
            ...DEFAULT_PROVIDER
          }

    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.resetForm                  = this.resetForm.bind(this); 
    this.resetFormAndResult         = this.resetFormAndResult.bind(this); 

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderConfirmCreate        = this.renderConfirmCreate.bind(this);
    this.doCreateProvider           = this.doCreateProvider.bind(this);
  }

  componentDidMount(){
    
  }
  
  componentDidUpdate(prevProps, prevState) 
  {
    if(prevProps.referrer !== this.props.referrer) {
      this.setState({
        referrer         : this.props.referrer
      });
    }
  }

  resetForm(){
    this.setState({
      provider: {
        ...DEFAULT_PROVIDER
      }
    });    
  }

  resetFormAndResult(){
    this.resetResult();
    this.resetForm();
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  backToDashboard = async () => {
    if(this.props.isAdmin)
      this.props.history.push({
        pathname: `/bankadmin/dashboard`
      })
    else
      this.props.history.push({
        pathname: `common/extrato`
      })
  }

  backToProviders = async () => {
    this.props.history.push({
      pathname: `/common/providers`
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        this.openNotificationWithIcon("warning", "Please check fields notifications!","")  
        return;
      }
      console.log('Received values of form: ', values);
      this.setState({provider:values, result:'should-confirm'});
      // this.setState({result:'should-confirm'});
    });
  };

  resetResult(){
    this.setState({result: undefined, result_object: undefined, error: {}});
    
  }

  doCreateProvider(){
    const {name, cnpj, email, phone, address, category, products_services, bank_account} = this.state.provider;
    const account_name = this.props.actualAccountName;
    api.bank.createOrUpdateProvider(undefined, name, cnpj, email, phone, address, category, products_services, [bank_account], account_name)
    .then((res)=>{
      console.log(' >> doCreateProvider >> ', JSON.stringify(res));
      this.setState({result:'ok'});
    }, (err)=>{
      this.setState({result:'error', error:err});
    })
    

  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    
    if(this.state.result=='should-confirm'){
      const confirm = this.renderConfirmCreate();
      return(
        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
          {confirm}
        </div>);
    }
    //
    if(this.state.result=='ok')
    {
      return (<Result
        status="success"
        title="Provider Created Succesfully!"
        subTitle=""
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button  key="go-to-providers" onClick={()=>this.backToProviders()}>
            Back to Providers
          </Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetFormAndResult()} />
        ]}
      />)
    }

    if(this.state.result=='error')
    {
      return (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                    Go to dashboard
                  </Button>,
                  <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetResult()} />
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
                    <Icon style={{ color: 'red' }} type="close-circle" /> {JSON.stringify(this.state.error)}
                  </Paragraph>
                </div>
              </Result>)
    }
    //
    
    // ** hack for sublime renderer ** //
    const {name, cnpj, email, phone, address, category, products_services, bank_account} = this.state.provider;
    const {pushingTx, loading} = this.state;
    const loading_text = pushingTx?'Pushing transaction...':(loading?'Loading...':'');
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

                <Form.Item label="Category">
                  {getFieldDecorator('category', {
                    rules: [{ required: true, message: 'Please input a category' }],
                    initialValue: category
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item label="Products/services">
                  {getFieldDecorator('products_services', {
                    rules: [{ required: true, message: 'Please input products/services!' }],
                    initialValue: products_services
                  })(<Input style={{ width: '100%' }} />)}
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
                    rules: [{ required: false, message: 'Please input Street!' }],
                    initialValue: address.street
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="City">
                  {getFieldDecorator('address.city', {
                    rules: [{ required: false, message: 'Please input City!' }],
                    initialValue: address.city
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="State/Province">
                  {getFieldDecorator('address.state', {
                    rules: [{ required: false, message: 'Please input State/Province!' }],
                    initialValue: address.state
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Zip / Postal Code">
                  {getFieldDecorator('address.zip', {
                    rules: [{ required: false, message: 'Please input Zip/Postal code!' }],
                    initialValue: address.zip
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Country">
                  {getFieldDecorator('address.country', {
                    rules: [{ required: false, message: 'Please input State/Province!' }],
                    initialValue: address.country
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <h3 className="fileds_header">BANK ACCOUNT</h3>
                <Form.Item label="Bank Name">
                  {getFieldDecorator('bank_account.bank_name', {
                    rules: [{ required: true, message: 'Please input Bank Name!' }],
                    initialValue: bank_account.bank_name
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Agency">
                  {getFieldDecorator('bank_account.agency', {
                    rules: [{ required: true, message: 'Please input Agency!' }],
                    initialValue: bank_account.agency
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="CC">
                  {getFieldDecorator('bank_account.cc', {
                    rules: [{ required: true, message: 'Please input CC!' }],
                    initialValue: bank_account.cc
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                      Create Provider
                    </Button>
                    
                  </Form.Item>
            </Form>  
          </Spin>
        </div>
    );
  }
  
  // ** hack for sublime renderer ** //

  render() {
    let content = this.renderContent();
    
    const routes    = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Create Provider"
          
        >
          
        </PageHeader>

        <Card 
            title={(<span>Provider data </span> )}
            key={'create_provider'}
            style = { { marginBottom: 24, marginTop: 24 } } 
            loading={this.state.pushingTx}
            >
          
          {content}
        </Card>

      </>
    );
  }
  //
  renderConfirmCreate(){
    const {name, cnpj, email, phone, category, products_services, bank_account}      = this.state.provider;
    
    return (<Result
      icon={<Icon type="question-circle" theme="twoTone" />}
      title={`Please confirm provider creation`} 
      subTitle={(<span> Name: {name}<br/> 
                  CNPJ: {cnpj}<br/>
                  Email: {email}<br/>
                  Phone: {phone}<br/> 
                  Category: {category}<br/>
                  Products/Services: {products_services}<br/>
                  Bank Account: {bank_account.bank_name}, {bank_account.agency}, {bank_account.cc} </span>)}
      extra={[<Button key="do_cerate_provider" type="primary" onClick={() => {this.doCreateProvider()} }>Confirm Create Provider</Button>,
              <Button key="cancel" onClick={() => {this.resetResult()} }>Cancel</Button>]}/>)
  }

}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        isAdmin:              loginRedux.isAdmin(state),
        isLoading:            loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        
    })
)(CreateProvider) ));