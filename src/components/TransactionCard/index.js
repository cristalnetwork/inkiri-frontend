import React, {Component} from 'react'
import { Alert } from 'antd';

import { connect } from 'react-redux'

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import TransactionHeader from '@app/components/TransactionCard/header';
import TransactionTypeAndAmount from '@app/components/TransactionCard/type_and_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import TransactionProvider from '@app/components/TransactionCard/provider';
import TransactionBlockchain from '@app/components/TransactionCard/blockchain';
import TransactionAttachments from '@app/components/TransactionCard/attachments';
import TransactionEnvelope from '@app/components/TransactionCard/envelope';
import NameValueIcon from '@app/components/TransactionCard/name_value_icon';

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

  render() {
    const { request, bank_account, uploader }   = this.state;
    
    if(!request)
      return(<></>);
    //
    const { formatMessage }   = this.props.intl;
    const alert               = this.getAlert(request);
    const __blockchain_title  = globalCfg.api.isService(request)?formatMessage({id:'components.TransactionCard.index.response_transaction'}):null;
    return (
      <>
      {alert}

        <div className="c-detail">
          
          <TransactionHeader request={request}/>
          
          <TransactionTypeAndAmount request={request}/>

          <TransactionPetitioner profile={request.requested_by}/>

          {
            request.requested_to && 
            <TransactionPetitioner title={formatMessage({id:'components.TransactionCard.index.requested_to'})} profile={request.requested_to}/>
          }
          
          {
            request.description 
            && <NameValueIcon name={formatMessage({id:'components.TransactionCard.index.message'})} value={request.description} icon="comment" />
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
          
          <TransactionBlockchain request={request} title={__blockchain_title}/>
          
          <TransactionAttachments request={request} uploader={uploader}/>
          
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
