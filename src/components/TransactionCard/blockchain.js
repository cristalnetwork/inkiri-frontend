import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import TransactionTitle from '@app/components/TransactionCard/title';
import ItemBlockchainLink from '@app/components/TransactionCard/item_blockchain_link';

const TransactionBlockchain = (props) => {
    
    const [request, setRequest]          = useState(props.request);    
    const [title, setTitle]              = useState(props.title||'Customer payment');    

    useEffect(() => {
      setRequest(props.request);
      setTitle(props.title||'Customer payment');    
    });

    if(!request || (!request.tx_id && !request.refund_tx_id))
      return (null);
    
    return( <>
        <TransactionTitle title="Blobkchain" />
        
        <div className="ui-list">
          <ul className="ui-list__content">
            <ItemBlockchainLink tx_id={request.tx_id}        title={title} />
            <ItemBlockchainLink tx_id={request.refund_tx_id} title={'Bank refund'} />
          </ul>
        </div>
      </>)  
}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TransactionBlockchain)