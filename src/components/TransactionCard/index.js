import React, {Component} from 'react'
import { Alert } from 'antd';

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import TransactionHeader from '@app/components/TransactionCard/header';
import TransactionTypeAndAmount from '@app/components/TransactionCard/type_and_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import FromTo from '@app/components/TransactionCard/from_to';
import TransactionProvider from '@app/components/TransactionCard/provider';
import TransactionBlockchain from '@app/components/TransactionCard/blockchain';
import TransactionAttachments from '@app/components/TransactionCard/attachments';
import TransactionEnvelope from '@app/components/TransactionCard/envelope';
import TransactionTitle from '@app/components/TransactionCard/title';
import Wage from '@app/components/TransactionCard/wage';
import NameValueIcon from '@app/components/TransactionCard/name_value_icon';

import * as utils from '@app/utils/utils';

import { Button } from 'antd';
import TransactionTitleAndAmount from '@app/components/TransactionCard/title_amount';
import IuguAlias from '@app/components/TransactionCard/iugu_alias';
import IuguHeader from '@app/components/TransactionCard/iugu_header';
import IuguInvoice from '@app/components/TransactionCard/iugu_invoice';
import ItemBlockchainLink from '@app/components/TransactionCard/item_blockchain_link';
import ItemLink from '@app/components/TransactionCard/item_link';
import ErrorItem from '@app/components/TransactionCard/item_error';
import * as request_helper from '@app/components/TransactionCard/helper';

import TransactionBankAccount from '@app/components/TransactionCard/bank_account';

import ServiceCard from '@app/components/TransactionCard/service_card';

import { FormattedMessage, injectIntl } from "react-intl";

/*
* ToDo: We should re read https://github.com/ant-design/ant-design/blob/master/components/form/demo/customized-form-controls.md
* up to provide decorator's validation.
*/
class TransactionCard extends Component {
  constructor(props) {
    super(props);
    const request       = props.request || undefined;
    const bank_account  = this.getBank(request);
    this.state = {
      request:         request,
      bank_account:    bank_account,
      uploader:        props.uploader||{}
    };
  }

  getBank = (request) => {
    return request?((globalCfg.api.isProviderPayment(request))? request.provider.bank_accounts[0] : request.bank_account):undefined;
  }

  componentDidUpdate(prevProps, prevState) 
  {
    const {request, uploader} = this.props;
    if(prevProps.request !== request || prevProps.uploader!=uploader) {
      
      const bank_account  = this.getBank(request);
      this.setState({request:        request,
                    bank_account:    bank_account,
                    uploader:         uploader}
      );
    }
  }
  
  getAlert(request){

    if(!(globalCfg.api.isProcessing(request) 
          && (globalCfg.api.isProviderPayment(request) || globalCfg.api.isExchange(request) )
          && this.props.isAdmin))
      return (null);

    const {formatMessage, formatHTMLMessage} = this.props.intl;
    return ( <Alert
                  message={ formatMessage({id:'components.TransactionCard.index.bank_transfer_required'}) }
                  description={ <>
                      <FormattedMessage tagName="span" id="components.TransactionCard.index.bank_transfer_description_1"  />
                      <br/><FormattedMessage tagName="span" id="components.TransactionCard.index.bank_transfer_description_2"  />
                      <br/><FormattedMessage tagName="span" id="components.TransactionCard.index.bank_transfer_description_3"  />
                   </> } 
                  type="warning"
                  style={{marginTop: '24px'}}
                  banner
                  closable
                  showIcon
              />)
    
  }

  iuguInfo = () => {
    const {request} = this.state;
    if(!request.iugu)
      return null;
    const invoice = request.iugu;
    console.log('invoice.state:', invoice.state)
    const paid_title = (invoice.state==request_helper.iugu.STATE_ISSUED)
      ? this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.paid_to'})
      : this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.tried_to_paid_to'});

    // const _invoice_original = (typeof invoice.original == 'string')
    //   ?JSON.parse(invoice.original)
    //   :invoice.original;
    
    const _invoice_original = utils.parseString(invoice.original);

    console.log('_invoice_original:', _invoice_original, _invoice_original.secure_url)
    console.log(typeof _invoice_original )

    return (      
        <>
          <div style={{margin:'24px 0px', borderTop: '1px solid rgba(0,0,0,0.25)', width:'100%'}}></div>
          
          <TransactionTitle title={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.iugu_payment'}) } button={(null)} />
          <IuguHeader invoice={invoice} />
          <TransactionTitleAndAmount title={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.amount'})} amount={parseFloat(invoice.amount).toFixed(2)}/>
          <IuguInvoice invoice={invoice} />
          

          <ItemLink 
            link={null} 
            href={_invoice_original.secure_url} 
            text={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.original_iugu_invoice'})} 
            icon="file-invoice" 
            icon_size="xs" 
            is_external={true} />

          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'pages.bankadmin.iugu.iugu_account'})}  
            value={invoice.iugu_account} 
            className="shorter" />
          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'pages.bankadmin.iugu.paid_at'})}  
            value={request_helper.formatUnix(invoice.paid_at)} 
            className="shorter" />
          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'components.TransactionTable.columns.issued_at'})}  
            value={request_helper.formatUnix(invoice.issued_at)} 
            className="shorter" />
          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.iugu_id'})}  
            value={invoice.iugu_id} 
            className="shorter" />
          <NameValueIcon 
            name={this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.origin_account'})}  
            value={invoice.iugu_account}
            className="shorter" />

          <TransactionTitle 
            title={ paid_title } />

          <div className="ui-list">
            <ul className="ui-list__content">
              <IuguAlias profile={{alias:invoice.receipt_alias}} alone_component={false} />          
            </ul>
          </div>
          
          {(invoice.issued_tx_id)?(
              <ItemBlockchainLink tx_id={invoice.issued_tx_id} title={ this.props.intl.formatMessage({id:'pages.bankadmin.iugu_details.issue_tx'}) } />
              ):(null)}

          
      </>);
  }

  //
  
  render() {
    const { request, bank_account, uploader }   = this.state;
      
    if(!request)
      return(<></>);
    //
    const { formatMessage }   = this.props.intl;

    let wages = (null);
    if(globalCfg.api.isSalary(request) && request.wages && request.wages.length>0)
    {
      const source = (this.props.isAdmin || this.props.isBusiness)
        ?request.wages
        :request.wages.filter(wage => wage.account_name==this.props.actualAccountName)
      wages =(<>
                <TransactionTitle title={ formatMessage({id:'global.wages'}) } />
                {source.map(wage => <Wage key={Math.random()} wage={wage} />)}</>);
    }
    
    //
    const iugu_info           = this.iuguInfo (); 
    //
    const alert               = this.getAlert(request);
    const __blockchain_title  = globalCfg.api.isService(request)?formatMessage({id:'components.TransactionCard.index.response_transaction'}):null;
    return (
      <>
      {alert}

        <div className="c-detail">
          
          <TransactionHeader request={request}/>
          
          <TransactionTypeAndAmount request={request}/>

          {
            request.flag && !request.flag.ok &&
              <NameValueIcon name={''} value={formatMessage({id:`requests.flags.${request.flag.message}`})} icon="exclamation-triangle" is_alarm={true} />
          }

          
          <FromTo request={request} />
          { false && <TransactionPetitioner profile={request.requested_by} title="Requested by" /> }
          { false && request.requested_to && <TransactionPetitioner title={formatMessage({id:'components.TransactionCard.index.requested_to'})} profile={request.requested_to}/> }
          
          <NameValueIcon name={formatMessage({id:'components.TransactionCard.index.message'})} value={'Ahi va crack!'} icon="comment" />

          {
            request.description && (request.description.trim()!='') 
            && <NameValueIcon name={formatMessage({id:'components.TransactionCard.index.message'})} value={request.description} icon="comment" />
          }
          
          {
            request.cancel_reason && (request.cancel_reason.trim()!='') 
            && <NameValueIcon name={formatMessage({id:'components.TransactionCard.index.cancel_reason'})} value={request.cancel_reason} icon="ban" />
          }

          <TransactionEnvelope request={request} />
          
          {
            (globalCfg.api.isExchange(request))
              ?(<TransactionBankAccount bank_account={bank_account} alone_component={false} />)
              :(<TransactionProvider request={request}/>)
          }

          {
            (globalCfg.api.isService(request))?
            (<ServiceCard request={request} />)
            :(null)
          }
          
          {wages}

          <TransactionBlockchain request={request} title={__blockchain_title}/>
          
          <TransactionAttachments request={request} uploader={uploader}/>
          
          {iugu_info}
      </div>
    </>);
  }

}

export default (connect(
    (state)=> ({
        actualAccountName:  loginRedux.actualAccountName(state),
        actualRole:         loginRedux.actualRole(state),
        actualPrivateKey:   loginRedux.actualPrivateKey(state),
        isLoading:          loginRedux.isLoading(state),
        isAdmin:            loginRedux.isAdmin(state),
        isBusiness:         loginRedux.isBusiness(state)
    }),
    (dispatch)=>({

    })
)( injectIntl(TransactionCard) ) );
