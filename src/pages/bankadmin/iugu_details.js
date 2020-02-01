import React, {Component} from 'react'

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'
import * as balanceRedux from '@app/redux/models/balance'

import * as api from '@app/services/inkiriApi';
import * as globalCfg from '@app/configs/global';
import * as request_helper from '@app/components/TransactionCard/helper';

import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Drawer, Modal, Card, PageHeader, Button, Spin, Form } from 'antd';

import TransactionTitleAndAmount from '@app/components/TransactionCard/title_amount';
import IuguAlias from '@app/components/TransactionCard/iugu_alias';
import IuguHeader from '@app/components/TransactionCard/iugu_header';
import IuguInvoice from '@app/components/TransactionCard/iugu_invoice';
import ItemBlockchainLink from '@app/components/TransactionCard/item_blockchain_link';
import ItemLink from '@app/components/TransactionCard/item_link';
import ErrorItem from '@app/components/TransactionCard/item_error';
import TransactionTitle from '@app/components/TransactionCard/title';

import TransactionPetitioner from '@app/components/TransactionCard/petitioner';

import AutocompleteAccount from '@app/components/AutocompleteAccount';

import NameValueIcon from '@app/components/TransactionCard/name_value_icon';

import TxResult from '@app/components/TxResult';
import {RESET_PAGE, RESET_RESULT, DASHBOARD} from '@app/components/TxResult';

import { injectIntl } from "react-intl";

const DEFAULT_RESULT = {
  result:             undefined,
  result_object:      undefined,
  error:              {},
}

const DEFAULT_ATTACHS = {
  attachments:       {
        [globalCfg.api.NOTA_FISCAL]       : undefined,
        [globalCfg.api.BOLETO_PAGAMENTO]  : undefined,
        [globalCfg.api.COMPROBANTE]       : undefined,
      }
}
class iuguDetails extends Component {
  constructor(props) {
    super(props);
    const invoice       = (props && props.location && props.location.state && props.location.state.invoice)? props.location.state.invoice : undefined;
    this.state = {
      referrer:        (props && props.location && props.location.state && props.location.state.referrer)? props.location.state.referrer : undefined,
      loading:      false,
      receipt:      '',
      amount:       0,
      memo:         '',
      pushingTx:    false,
      
      ...DEFAULT_RESULT,
      
      invoice:       invoice,
      
      ...DEFAULT_ATTACHS,
    };

    // this.handleSearch = this.handleSearch.bind(this); 
    this.onSelect                   = this.onSelect.bind(this); 
    this.renderContent              = this.renderContent.bind(this); 
    this.resetPage                  = this.resetPage.bind(this); 
    this.userResultEvent            = this.userResultEvent.bind(this); 
    this.setAlias                   = this.setAlias.bind(this); 
    this.handleChooseAliasAccount   = this.handleChooseAliasAccount.bind(this); 
  }

  componentDidMount(){
    if(this.props.location && this.props.location.state)
    {
      this.setState({  invoice : this.props.location.state.invoice })
    }
  }

  reload(){
    const that      = this;
    const {invoice} = this.state;
    this.setState({pushingTx:true});
    console.log(' trying to reload invoice:', invoice.id)
    api.bank.getIuguInvoiceById(invoice.id)
        .then( (data) => {
            that.setState({pushingTx:false, invoice:data})
          },
          (ex) => {
            components_helper.notif.exceptionNotification( 
              that.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.error.while_reloading'}),
              ex
            );
            that.setState({pushingTx:false});
            console.log(' ** ERROR @ iuguDetails', JSON.stringify(ex))
          }  
        );
  }

  onSelect(value) {
    console.log('onSelect', value);
    this.setState({receipt:value})
  }

  backToDashboard = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/dashboard`
    })
  }

  backToReferrer = async () => {
    this.props.history.push({
      pathname: this.state.referrer
    })
  }

  resetPage(){
    this.setState({...DEFAULT_RESULT});
  }

  resetResult(){
    this.setState({...DEFAULT_RESULT});
  }

  userResultEvent = (evt_type) => {
    console.log(' ** userResultEvent -> EVT: ', evt_type)
    if(evt_type==DASHBOARD)
      this.backToDashboard();
    if(evt_type==RESET_RESULT)
      this.resetResult();
    if(evt_type==RESET_PAGE)
      this.resetPage();
    
  }

  onAccountAliasSelect =(account) =>{
    this.setState({account_alias:account})
  }

  setAlias(){
    this.setState({show_set_alias:true})
  }
  
  onCloseSetAlias = () => {
    this.setState({
      show_set_alias: false,
    });
  };

  handleChooseAliasAccount = (e) => {
    e.preventDefault();
    let that = this;
    this.props.form.validateFields((err, values) => {
      
      if (err) {
        components_helper.notif.errorNotification( this.props.intl.formatMessage({id:'errors.validation_title'}), this.props.intl.formatMessage({id:'errors.verify_on_screen'}) )    
        console.log(' ERRORS!! >> ', err)
        return;
      }

      // console.log('--values::', values)
      that.setState({pushingTx:true})
      api.bank.updateIuguAlias(that.state.invoice._id, values.business)
        .then( (data) => {
            that.setState({pushingTx:false})
            components_helper.notif.successNotification( 
              that.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.success.alias_update'}),
            );
            that.reload();
            setTimeout(()=> {
              that.setState({show_set_alias:false})
            } ,500);
          },
          (ex) => {
            that.setState({pushingTx:false})
            components_helper.notif.exceptionNotification( 
              that.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.error.occurred_title'}),
              ex
            );
            console.log(' ** ERROR @ processInvoice', JSON.stringify(ex))
          }  
        );
    
    });
  };



  showSetAlias = () =>{
    const {show_set_alias} = this.state;
    if(!show_set_alias)
      return null;

    let that = this;   

    return(

      <Drawer
          title={ <div style={{ textAlign:'center', margin: '0 auto', width:700}}>{this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.upsert_alias_title'})}</div> }
          placement="top"
          closable={true}
          visible={this.state.show_set_alias}
          getContainer={false}
          style={{ position: 'absolute' }}
          bodyStyle={{margin: '0 auto', }}
          keyboard={true}
          height="600px"
          onClose={this.onCloseSetAlias}
        >
          <Card 
              key="choose_alias_account"
              loading={this.state.pushingTx}
              style={{width:700, margin: '0 auto'}}
              headStyle={{display:'none'}}
              >
            <Form onSubmit={this.handleChooseAliasAccount}>
              <AutocompleteAccount  callback={this.onAccountAliasSelect} form={this.props.form} name="business" 
                          filter={globalCfg.bank.ACCOUNT_TYPE_BUSINESS} 
                          exclude_list={[]} />
              <div className="mp-box__actions mp-box__shore">
                <Button size="large" key="requestButton" htmlType="submit" type="primary" htmlType="submit" >{this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.choose_account_action'})}</Button>
                <Button size="large" className="danger_color" type="link" onClick={this.onCloseSetAlias}>
                  {this.props.intl.formatMessage({id:'global.cancel'})}
                </Button>
              </div>
            </Form>
          </Card>
       </Drawer>
     );
  }
  //
  renderContent() {
    
    if(this.state.result)
    {
      const result_type = this.state.result;
      const title       = null;
      const message     = null;
      const tx_id       = this.state.result_object?this.state.result_object.transaction_id:null;
      const error       = this.state.error
      
      const result = (<TxResult result_type={result_type} title={title} message={message} tx_id={tx_id} error={error} cb={this.userResultEvent}  />);
      return (<div style={{ margin: '0 0px', padding: 24, marginTop: 24}}>
                <div className="ly-main-content content-spacing cards">
                  <section className="mp-box mp-box__shadow money-transfer__box">
                    {result}
                  </section>
                </div>      
              </div>);
    }
    //
    const {invoice, pushingTx}      = this.state;
    const buttons                   = this.getActionsForInvoice();
     
     //<Alert message={invoice.error} description="Cant fetch alias or there is no account related to invoice alias." type="error" showIcon/>

    return (
      <Spin spinning={pushingTx} delay={500} tip={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.pushing_tx'}) }>
        <div className="c-detail">
          
          <IuguHeader invoice={invoice} />
          <TransactionTitle title={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.iugu_payment'}) } button={(null)} />
          
          <TransactionTitleAndAmount title={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.amount'})} amount={parseFloat(invoice.amount).toFixed(2)}/>
          <IuguInvoice invoice={invoice} />
          

          <ItemLink 
            link={null} 
            href={invoice.original.secure_url} 
            text={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.original_iugu_invoice'})} 
            icon="file-invoice" 
            icon_size="lg" 
            is_external={true} />

          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'pages.bankadmin.iugu.iugu_account'})}  
            value={invoice.iugu_account} 
            className="shorter" />

          <TransactionTitle 
            title={ this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.paid_to'}) } 
            button={<Button type="primary" onClick={this.setAlias} icon="edit" >{this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.upsert_alias'})}</Button>} />

          <div className="ui-list">
            <ul className="ui-list__content">
              <IuguAlias profile={{alias:invoice.receipt_alias}} alone_component={false} />          
              {(invoice.receipt)?(
                <TransactionPetitioner profile={invoice.receipt} title={ this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.destination_account'}) } />
                ):( <ErrorItem 
                      title={invoice.error} 
                      message={ this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.cant_fetch_alias'}) } 
                      />)}
            </ul>
          </div>
          
          {(invoice.issued_tx_id)?(
              <ItemBlockchainLink tx_id={invoice.issued_tx_id} title={ this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.issue_tx'}) } />
              ):(null)}

          <TransactionTitle title={ `ID #${invoice._id}` } />

        </div>
        <div className="c-detail bottom">
          <Card style={ { marginBottom: 24, textAlign:'center' } }>
          { buttons?buttons.map(button=>button):(<></>)}
          </Card>
        </div>
      </Spin>);
  }
  
  processInvoice(){
    let that = this;  
    
    
    Modal.confirm({
      title: this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.confirm_re_process'}) ,
      content: this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.about_to_issue'}),
      onOk() {
        that.setState({pushingTx:true});
        api.bank.processIuguInvoiceById(that.state.invoice._id)
        .then( (data) => {
            that.setState({pushingTx:false})
            components_helper.notif.successNotification( 
              that.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.success.process'}),
            );
            that.reload();
          },
          (ex) => {
            that.setState({pushingTx:false})
            components_helper.notif.exceptionNotification( 
              that.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.error.occurred_title'}),
              ex
            );
            console.log(' ** ERROR @ processInvoice', JSON.stringify(ex))
          }  
        );
        
      },
      onCancel() {
        that.setState({pushingTx:false})
      },
    });
    
  }
  
  
  getActionsForInvoice(){
    const {invoice, pushingTx}    = this.state;
    
    const processButton = (<Button loading={pushingTx} size="large" onClick={() => this.processInvoice()} key="processButton" type="primary" title="" >{this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.re_process'})}</Button>);
    //
    switch (invoice.state){
      case request_helper.iugu.STATE_ERROR:
      case request_helper.iugu.STATE_ISSUE_ERROR:
        return [processButton];
      break;
      default:
        return[]
      break;
    }
  }

  //
  render() {
    let content          = this.renderContent();
    const title          = this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.title'});
    const routes         = routesService.breadcrumbForPaths([this.state.referrer, this.props.location.pathname]);
    const show_set_alias = this.showSetAlias();

    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title={title}>
        </PageHeader>
        
        {show_set_alias}
        {content}

      </>
    );
  }
  
}

//
export default Form.create() (withRouter(connect(
    (state)=> ({
        accounts:           accountsRedux.accounts(state),
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        balance:            balanceRedux.userBalanceFormatted(state),
        isAdmin:            loginRedux.isAdmin(state),
        isBusiness:         loginRedux.isBusiness(state)
    }),
    (dispatch)=>({
        // isAdmin:    bindActionCreators(loginRedux.isAdmin, dispatch),
        // isBusiness: bindActionCreators(loginRedux.isBusiness, dispatch)
    })
)( injectIntl(iuguDetails)) )
);
