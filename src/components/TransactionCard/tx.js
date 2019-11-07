import React, {Component} from 'react'
import { Alert, Upload, Tag, Spin, Icon, Autocomplete, Button, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';

import { withRouter } from "react-router-dom";

import * as utils from '@app/utils/utils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as request_helper from '@app/components/TransactionCard/helper';
import TransactionHeader from '@app/components/TransactionCard/header';
import TransactionTypeAndAmount from '@app/components/TransactionCard/type_and_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import TransactionProvider from '@app/components/TransactionCard/provider';
import TransactionBlockchain from '@app/components/TransactionCard/blockchain';

import ItemBlockchainLink from '@app/components/TransactionCard/item_blockchain_link';
import ItemLink           from '@app/components/TransactionCard/item_link';

const { Dragger } = Upload;

// const icon_color_default = '#1890ff';
// const icon_color_green   = '#3db389';

/*
* ToDo: We should re read https://github.com/ant-design/ant-design/blob/master/components/form/demo/customized-form-controls.md
* up to provide decorator's validation.
*/
class Tx extends Component {
  constructor(props) {
    super(props);
    const transaction   = props.transaction || undefined;
    const request       = props.request || undefined;
    const onViewRequest = props.onViewRequest;
    this.state = {
      transaction:     transaction,
      request:         request,
      onViewRequest:   onViewRequest
    };
    this.onEvent = this.onEvent.bind(this);
  }

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.transaction !== this.props.transaction ) {
          this.setState({
            transaction     : this.props.transaction
          });
      }

      if(prevProps.request !== this.props.request ) {
          this.setState({
            request     : this.props.request
          });
      }
  }

  onEvent(){
    const {onViewRequest, request} = this.state;
    if(typeof onViewRequest === 'function') {
      onViewRequest(request)
    }
  }

  render() {
    const { transaction, request }   = this.state;
    
    return (
      <>
        <div className="c-detail">
          
          <TransactionHeader transaction={transaction}/>
          
          <TransactionTypeAndAmount transaction={transaction}/>

          {request?
          (<ItemLink 
              link={<Button type="link" size="large" onClick={() => this.onEvent()} >View request</Button>}
              icon="file-invoice" 
              is_external={false}
                    />) : (null)}

          <ItemBlockchainLink tx_id={transaction.transaction_id} title={'Transaction'} />



      </div>
    </>);

    // const alert = this.getAlert(request);
    // return (
    //   <>
    //   {alert}

    //     <div className="c-detail">
          
    //       <TransactionHeader request={request}/>

    //       <TransactionTypeAndAmount request={request}/>

    //       <TransactionPetitioner profile={request.requested_by}/>
          
    //       <TransactionEnvelope request={request} />
          
    //       <TransactionProvider request={request}/>
        
    //       <TransactionBlockchain request={request}/>
          
    //       <TransactionAttachments request={request} uploader={uploader}/>
          
    //   </div>
    // </>);
  }

}

// export default (TransactionCard)

export default (withRouter(connect(
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
)(Tx) ) );