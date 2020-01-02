import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as accountsRedux from '@app/redux/models/accounts';
import * as loginRedux from '@app/redux/models/login'
import * as graphqlRedux from '@app/redux/models/graphql'

import * as utils from '@app/utils/utils';
import * as globalCfg from '@app/configs/global';
import * as validators from '@app/components/Form/validators';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as components_helper from '@app/components/helper';

import AutocompleteAccount from '@app/components/AutocompleteAccount';
import ProfileMini from '@app/components/TransactionCard/profile_mini';

import { withRouter } from "react-router-dom";

import { Select, notification, Empty, Button, Form, message, AutoComplete, Input, Icon } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";

const DEFAULT_STATE = {
      input_amount: {  
        style   :           {maxWidth: 370, fontSize: 100, width: 60}
         , value :          undefined 
         , symbol_style :   {fontSize: 60}
       }
};


class AddMemberForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      job_positions:   props.jobPositions,
      member:          props.member,
      callback:        props.callback,
      // position:      props.position,
      // wage:          props.wage,
      ...DEFAULT_STATE
    };
    this.onInputAmount              = this.onInputAmount.bind(this);
    this.handleSubmit               = this.handleSubmit.bind(this);
    this.onSelect                   = this.onSelect.bind(this)
    this.handleJobPositionChange    = this.handleJobPositionChange.bind(this); 
  }

  componentDidMount(){
    if(utils.arrayNullOrEmpty(this.state.job_positions))
      this.props.loadConfig();
    else
      this.setDefaultWage();
  }

  componentDidUpdate(prevProps, prevState) 
  {
    if(!utils.objectsEqual(prevProps.jobPositions, this.props.jobPositions) ){  
      this.setState({
          job_positions: this.props.jobPositions,
      }, () => {
          this.setDefaultWage();
      });
    }
  }

  setDefaultWage = () =>{
    const {member} = this.state;
    if(!member)
      return;
    this.onInputAmount(member.wage);
  }

  /*
  * Components' Events.
  */
    
  fireEvent = (error, cancel, data) => {
    const {callback} = this.state;
    if(typeof  callback === 'function') {
        callback(error, cancel, data)
    }
  }
  
  handleJobPositionChange = (value) => {
    
    const {job_positions} = this.state;
    const wage = job_positions.filter(j=>j.key==value)[0].amount;
    this.onInputAmount(wage);

  }

  onSelect = (e) => {
  
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, values) => {
      const {formatMessage} = this.props.intl;
      if (err) {

        components_helper.notif.errorNotification( formatMessage({id:'errors.validation_title'}), formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }
      const {member} = this.state;
      if(!member)
      {
        const exists = this.props.accounts.filter( account => account.key==values.member);
        if(!exists || exists.length==0)
        {
          components_helper.notif.errorNotification( formatMessage({id:'errors.select_account_from_list'}) )    
          return;
        }
      }

      const editing = (member!=null);
      let my_member = (editing)
        ? { ...values, member:member.member._id, _id:member._id}
        : { ...values };

      this.fireEvent(null, null, my_member);
      
    });
  };

  resetForm(){
    
    // this.setState({...DEFAULT_STATE});
  }

  onInputAmount(param){
    let the_value = param;
    if(typeof param !== 'number' && typeof param !== 'string')
    {
      param.preventDefault();
      the_value = param.target.value;
    }
    
    const _input_amount = this.state.input_amount;
    this.props.form.setFieldsValue({'input_amount.value':the_value})
    this.setState({input_amount: {..._input_amount, value: the_value}}, 
      () => {
        if(the_value && the_value.toString().length){
          const value = the_value.toString();
          var digitCount = value.length > 0 ? value.replace(/\./g,"").replace(/,/g,"").length : 1
          var symbolCount = value.length > 0 ? value.length - digitCount : 0;
          const isMobile = false;
          var size = isMobile ? 48 : 100

          if(digitCount > 7){
            size = isMobile ? 40 : 48
          } else if(digitCount > 4){
            size = isMobile ? 48 : 70
          }

          const {input_amount} = this.state;
          this.setState({
                  input_amount : {
                    ...input_amount
                    , style :       {fontSize: size, width:(digitCount * (size*0.6))+(symbolCount * (size*0.2)) }
                    , symbol_style: {fontSize:  (size*0.6)}
                  }
                });
        }
      });
  }

  renderMemberSelector(){
    const {member}              = this.state;
    const { form, intl }        = this.props;
    // const { getFieldDecorator } = form;
    const my_accounts           = this.props.accounts.filter(acc=>acc.key!=this.props.actualAccountName && globalCfg.bank.isPersonalAccount(acc)).map(acc=>acc.key)
    let selector   = null;
    //
    if(member){
      selector = (<ProfileMini profile={member.member} title={ intl.formatMessage({id:'components.forms.add_member.member'}) } not_alone={false} gray_bg={true} />);
    }
    else{
      selector = <AutocompleteAccount callback={this.onSelect} form={form} name="member" filter={globalCfg.bank.ACCOUNT_TYPE_PERSONAL} exclude_list={[]}/>;
    }
    return selector;
  }
  //
  renderJobPosition(){
    const {job_positions, member} = this.state;
    if(!job_positions)
      return (null);

    const { formatMessage }       = this.props.intl;
    const position                = (member)?member.position:undefined;
    const { getFieldDecorator }   = this.props.form;
    const selector = (<Form.Item>
          {getFieldDecorator( 'position', {
            rules: [{ required: true, message: formatMessage({id:'components.forms.validators.forgot_job_position'}) }]
            , onChange: (e) => this.handleJobPositionChange(e)
            , initialValue: position
          })(
            <Select placeholder={ formatMessage({id:'components.forms.add_member.choose_job_position'}) } >
            {
              job_positions.map( position => 
                {
                  return (<Select.Option key={'position_'+position.key} value={position.key} label={position.value}>{ position.value } </Select.Option> )
                }
              )
            }
            </Select>
          )}
      </Form.Item>
    );
    //

    return (<div className="money-transfer__row row-complementary money-transfer__select" >
              <div className="badge badge-extra-small badge-circle addresse-avatar ">
                  <span className="picture">
                    <FontAwesomeIcon icon={['fab', 'pagelines']} size="lg" color="black"/>
                  </span>
              </div>
              <div className="money-transfer__input money-transfer__select">
                {selector}
              </div>
          </div>);
  }
  
  //

  render() {
    const { formatMessage }        = this.props.intl;
    const { getFieldDecorator }    = this.props.form;
    const { input_amount, member } = this.state;
    
    const job_options_item         = this.renderJobPosition();
    const member_selector          = this.renderMemberSelector();
    const button_text              = member?formatMessage({id:'components.forms.add_member.modify_member'}):formatMessage({id:'components.forms.add_member.add_member'});
    return (
        <Form onSubmit={this.handleSubmit}>
          <div className="money-transfer">    
            {member_selector}
            {job_options_item}
            <Form.Item label="Amount" className="money-transfer__row input-price" style={{textAlign: 'center'}}>
                  {getFieldDecorator('input_amount.value', {
                    rules: [{ required: true, 
                        message: formatMessage({id:'components.forms.validators.forgot_amount'}), 
                        whitespace: true, 
                        validator: validators.checkPrice }],
                  })( 
                    <>  
                      <span className="input-price__currency" id="inputPriceCurrency" style={input_amount.symbol_style}>
                        {globalCfg.currency.fiat.symbol}
                      </span>
                      
                    <Input
                      type="tel" 
                      step="0.01" 
                      className="money-transfer__input input-amount placeholder-big" 
                      placeholder="0" 
                      onChange={this.onInputAmount}  
                      value={input_amount.value} 
                      style={input_amount.style}  
                    />
                  </>
                )}
          </Form.Item>
        </div>
        <div className="mp-box__actions mp-box__shore">
          <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{button_text}</Button>
          <Button size="large" className="danger_color" type="link" onClick={()=>{this.fireEvent(null, true, null)}}>
            { formatMessage({id:'global.cancel'}) }
          </Button>
        </div>
      </Form>
    );
  }

  
}
//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        actualAccountName:  loginRedux.actualAccountName(state),
        jobPositions:       graphqlRedux.jobPositions(state),
    }),
    (dispatch)=>({
        loadConfig:         bindActionCreators(graphqlRedux.loadConfig, dispatch),
    })
)( injectIntl(AddMemberForm)) )
);
