import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import { injectIntl } from "react-intl";

import TransactionTitle from '@app/components/TransactionCard/title';
import ItemBlockchainLink from '@app/components/TransactionCard/item_blockchain_link';

const TransactionBlockchain = (props) => {
    
    const [request, setRequest]          = useState(props.request);    
    const [title, setTitle]              = useState(props.title);    

    useEffect(() => {
      setRequest(props.request);
    }, [props.request]);

    useEffect(() => {
      setTitle(props.title);    
    }, [props.title]);

    const [tx_refund_text, setRefundText]               = useState('');    
    const [money_transfer_text, setMoneyTransferText]   = useState('');    
    const [blockchain_text, setBlockchainText]          = useState('');    

    useEffect(() => {
      setRefundText(props.intl.formatMessage({id:'components.TransactionCard.blockchain.tx_refund'}));
      setMoneyTransferText(props.intl.formatMessage({id:'components.TransactionCard.blockchain.money_transfer'}));
      setBlockchainText(props.intl.formatMessage({id:'components.TransactionCard.blockchain.blockchain'}));
    }, []);

    if(!request || (!request.tx_id && !request.refund_tx_id))
      return (null);
    
    // console.log(' -- TransactionBlockchain:', title)
    return( <>
        <TransactionTitle title={blockchain_text} />
        
        <div className="ui-list">
          <ul className="ui-list__content">
            <ItemBlockchainLink tx_id={request.tx_id}        title={title||money_transfer_text} />
            <ItemBlockchainLink tx_id={request.refund_tx_id} title={tx_refund_text} />
          </ul>
        </div>
      </>)  
}
//
export default connect(
    (state)=> ({
        
    })
)(injectIntl(TransactionBlockchain))