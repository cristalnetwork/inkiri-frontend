import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';

import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import * as request_helper from '@app/components/TransactionCard/helper';

import { Modal, List, Skeleton, notification, Select, Button , Form, Icon, InputNumber, Input, DatePicker } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';

import * as form_helper from '@app/components/Form/form_helper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as moment from 'moment';

class SalaryForm extends Component {
  constructor(props) {
    super(props);
    const last_month      = moment().subtract(1, "month").startOf("month");
    const last_month_text = last_month.format(form_helper.MONTH_FORMAT_HUMANIZED);
    this.state = {
      members         : props.members,
      callback        : props.callback,
      job_positions   : props.job_positions,
      payment         : {
        description:  `Ref. ${last_month_text}`,
        worked_month: last_month,
        total:        globalCfg.currency.toCurrencyString(props.members.reduce((acc, member) => acc + member.current_wage, 0))        
      }

    };
    this.renderContent              = this.renderContent.bind(this); 
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 

  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.profile !== this.props.profile) {
          this.setState({
            members         : this.props.members,
            callback        : this.props.callback,
            job_positions   : this.props.job_positions
          });
      }
  }

  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }

  fireEvent = (error, cancel, data) => {
    const {callback} = this.state;
    if(typeof  callback === 'function') {
        callback(error, cancel, data)
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        this.openNotificationWithIcon("error", "Validation errors","Please verifiy errors on screen!")    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const that = this;
      Modal.confirm({
        title: 'Confirm salaries payment',
        content: (<p>You are about to pay salaries for <b>{this.state.payment.total}</b>. Continue or cancel.</p>),
        onOk() {
          that.fireEvent(null, null, values);
        },
        onCancel() {
          that.fireEvent(null, true, null);
        },
      });

      // if(!this.state.profile)
      // {
      //   this.openNotificationWithIcon("error", 'You must choose a Profile!');
      //   return;
      // }
      
      
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }


  fake = () => {}

  renderContent() {  
    const { members, job_positions, payment }   = this.state;
    const { form }                              = this.props;
    
    const getJobPositionTitle = (position,  job_positions) => {
      const _position = job_positions?job_positions.filter(pos=>pos.key==position)[0].title:position;
      return _position;
    }
    return (
        <Form onSubmit={this.handleSubmit} className="with_labels">
            <div className="money-transfer">
              {form_helper.simple(form_helper.getStringItem(form, payment , 'description'  , 'Payment Desciription' , 'Please input a description!'))}
              {form_helper.simple(form_helper.getMonthItem(form,  payment  , 'worked_month' , 'Worked Month'         , 'Please input a valid Date!'))}
              
              <br/><br/>
              <div className="c-header-detail__head u-clearfix">
                <div className="c-header-detail__title">Wages</div>
                <div className="c-header-detail__actions"><strong>{payment.total}</strong></div>
              </div>
              
              <InfiniteScroll
                    loadMore={this.fake}
                    initialLoad={false}
                    pageStart={0}
                    hasMore={false}
                    useWindow={false}
                    style={{ overflow: 'auto', padding: '8px 24px', maxHeight: 450, border: '1px solid #e8e8e8', borderRadius: '4px' }} >
                <List
                  itemLayout="horizontal"
                  dataSource={[...members]}
                  renderItem={member => (
                    <List.Item>
                        <List.Item.Meta
                          avatar={<span className="ant-avatar"> <FontAwesomeIcon icon={['fab', 'pagelines']} size="lg" color="gray"/> </span>}
                          title={<a href="#">{request_helper.getProfileName(member.member)}</a>}
                          description={'@'+member.member.account_name}
                        />
                        <div className="right">
                          <div className="last-1"> {getJobPositionTitle(member.position, job_positions)}</div>
                          <div className="last"> 
                                <span className="money">{globalCfg.currency.toCurrencyString(member.current_wage)}</span>
                                <br/><span className="ant-list-item-meta-description">{member.current_reason}</span>
                          </div>
                        </div>
                    </List.Item>
                  )}
                />
              </InfiniteScroll>

            </div>
            
            <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="paySalaries" htmlType="submit" type="primary" >PAY</Button>
                <Button size="large" key="cancelPayment" type="link" onClick={ () => this.fireEvent(null, true, null)}>CANCEL</Button>
            </div>

        </Form>
    );
    
  }
  //

  render() {
    let content     = this.renderContent();
    

    if(!this.state.alone_component)
      return content;

    return (
      <div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
        <div className="ly-main-content content-spacing cards">
          <section className="mp-box mp-box__shadow money-transfer__box">
            {content}
          </section>
        </div>      
      </div>
    );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualAccountProfile: loginRedux.actualAccountProfile(state),
        actualRole:           loginRedux.actualRole(state),
        actualPrivateKey:     loginRedux.actualPrivateKey(state),
        isLoading:            loginRedux.isLoading(state),
        personalAccount:      loginRedux.personalAccount(state),
        balance:              balanceRedux.userBalance(state),
    }),
    (dispatch)=>({
        
    })
)(SalaryForm) )
);
