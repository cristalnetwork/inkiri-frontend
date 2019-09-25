import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import AmountInput from '@app/components/AmountInput';

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";

import { Result, Card, PageHeader, Tag, Button, Statistic, Row, Col, Spin } from 'antd';
import { notification, Form, Icon, InputNumber, Input, AutoComplete, Typography } from 'antd';

import * as routesService from '@app/services/routes';

const { Paragraph, Text } = Typography;

const routes = routesService.breadcrumbForFile('providers');

const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };


class CreateProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:      true,
      value:       {amount:0, currency:''},
      pushingTx:    false,
      envelope_id:  '--loading--',
      result:       undefined,
      result_object:undefined,
      error:        {},
      number_validateStatus : '',
      number_help:  '',
      
      name:       '',
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

      bank_name:    '',
      agency:    '',
      cc:    '',

    };

    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.resetResult                = this.resetResult.bind(this); 
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
    this.renderConfirmRequest       = this.renderConfirmRequest.bind(this);
  }

  componentDidMount(){
    
  }
  
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

   handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        // this.setState({result:'should-confirm'});
      }
    });
  };

  resetResult(){
    this.setState({result: undefined, result_object: undefined, error: {}});
    this.getNextEnvelopeId();
  }

  doCreateProvider(){
    // guarda
    api.bank.createDeposit(this.props.actualAccount, this.state.value.amount, this.state.value.currency)
    .then((res)=>{
      console.log(' >> doDeposit >> ', JSON.stringify(res));
      this.setState({result:'ok'});
    }, (err)=>{
      this.setState({result:'error', error:err});
    })
    

  }

  renderContent() {
  
    const { getFieldDecorator } = this.props.form;
    
    let result_or_confirm = null;
    if(this.state.result=='should-confirm'){
      result_or_confirm = this.renderConfirmRequest();
    }

    if(this.state.result=='ok')
    {
      const tx_id = api.dfuse.getTxId(this.state.result_object?this.state.result_object.data:{});
      const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
      // console.log(' >>>>> api.dfuse.getBlockExplorerTxLink: ', _href)
      
      result_or_confirm = (<Result
        status="success"
        title="Deposit Requested Succesfully!"
        subTitle="Please wait until deposit is validated and cedited to your account."
        extra={[
          <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
            Go to dashboard
          </Button>,
          <Button shape="circle" icon="close-circle" key="close" onClick={()=>this.resetResult()} />
        ]}
      />)
    }

    if(this.state.result=='error')
    {
      result_or_confirm = (<Result
                status="error"
                title="Transaction Failed"
                subTitle="Please check and modify the following information before resubmitting."
                extra={[
                  <Button type="primary" key="go-to-dashboard" onClick={()=>this.backToDashboard()}>
                    Go to dashboard
                  </Button>,
                  <Button key="re-send">Try deposit again</Button>,
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
    
    if(result_or_confirm)
      return(
        <div style={{ margin: '0 0px', padding: 24, background: '#fff', marginTop: 24  }}>
          {result_or_confirm}
        </div>);

    // ** hack for sublime renderer ** //
    const {name, cnpj, email, phone, address, category, products_services, bank_name, agency, cc} = this.state;
    const {pushingTx, loading} = this.state;
    const loading_text = pushingTx?'Pushing transaction...':(loading?'Loading...':'');
    return (
        <div style={{ margin: '0 0px', maxWidth: '600px', background: '#fff'}}>
          <Spin spinning={this.state.pushingTx} delay={500} tip="Pushing transaction...">
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              <h3 className="fileds_header">PROFILE SECTION</h3>
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
                
                <h4 style={{paddingLeft: 50}}>Address</h4>
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
                  {getFieldDecorator('bank_name', {
                    rules: [{ required: true, message: 'Please input Bank Name!' }],
                    initialValue: bank_name
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="Agency">
                  {getFieldDecorator('agency', {
                    rules: [{ required: true, message: 'Please input Agency!' }],
                    initialValue: agency
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
                <Form.Item label="CC">
                  {getFieldDecorator('cc', {
                    rules: [{ required: true, message: 'Please input CC!' }],
                    initialValue: cc
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" disabled>
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
    
    return (
      <>
        <PageHeader
          breadcrumb={{ routes }}
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

  renderConfirmRequest(){
    const {amount, currency}      = this.state.value;
    return (<Result
      icon={<Icon type="question-circle" theme="twoTone" />}
      title={`You will deposit ${currency} ${amount}`} 
      subTitle="Please confirm operation."
      extra={[<Button key="do_deposit" type="primary" onClick={() => {this.doCreateProvider()} }>Confirm Deposit</Button>,
              <Button key="cancel" onClick={() => {this.resetResult()} }>Cancel</Button>]}/>)
  }
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccount:    loginRedux.actualAccount(state),
        actualRole:       loginRedux.actualRole(state),
        isLoading:        loginRedux.isLoading(state)
    }),
    (dispatch)=>({
        
    })
)(CreateProvider) ));