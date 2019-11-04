import React, {Component} from 'react'
import { Alert, Upload, Tag, Spin, Icon, Autocomplete, Button, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';

// import './style.less'; 

import * as utils from '@app/utils/utils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as request_helper from '@app/components/TransactionCard/helper';
import TransactionHeader from '@app/components/TransactionCard/header';
import TransactionTypeAndAmount from '@app/components/TransactionCard/type_and_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import TransactionProvider from '@app/components/TransactionCard/provider';
import TransactionBlockchain from '@app/components/TransactionCard/blockchain';
import TransactionAttachments from '@app/components/TransactionCard/attachments';
import TransactionEnvelope from '@app/components/TransactionCard/envelope';

const { Dragger } = Upload;

// const icon_color_default = '#1890ff';
// const icon_color_green   = '#3db389';

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
    if(globalCfg.api.isProcessing(request) && globalCfg.api.isProviderPayment(request) && this.props.isAdmin)
      return ( <Alert
                  message="Bank transfer required!"
                  description={(<>
                      <span>Please complete the following tasks required for this operation:</span>
                      <br/><span>1.- Log into your Commercial Bank online service and proceed to send the money by wire transfer.</span>
                      <br/><span>2.- Attach a copy of the bank transfer voucher/receipt pdf file.</span>
                      <br/><span>3.- Press 'Finish' button</span>
                    </>)} 
                  type="warning"
                  style={{marginTop: '24px'}}
                  banner
                  closable
                  showIcon
              />)
    return (null);
  }

  render() {
    const { request, bank_account, uploader }   = this.state;
    
    if(!request)
      return(<></>);
    //
      
    console.log('rendering..........................')
    const alert = this.getAlert(request);
    
    return (
      <>
      {alert}

        <div className="c-detail">
          
          <TransactionHeader request={request}/>

          <TransactionTypeAndAmount request={request}/>

          <TransactionPetitioner profile={request.requested_by}/>
          
          <TransactionEnvelope request={request} />
          
          <TransactionProvider request={request}/>
        
          <TransactionBlockchain request={request}/>
          
          <TransactionAttachments request={request} uploader={uploader}/>
          
      </div>
    </>);
  }

}

// export default (TransactionCard)

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
        // isAdmin:    bindActionCreators(loginRedux.isAdmin, dispatch),
        // isBusiness: bindActionCreators(loginRedux.isBusiness, dispatch)
    })
)(TransactionCard) );
