import React from 'react'
import { connect } from 'react-redux'
import * as request_helper from '@app/components/TransactionCard/helper';
import * as utils from '@app/utils/utils'; 

import InjectMessage from "@app/components/intl-messages";

const IuguHeader = ({invoice}) => {
    
    let header = (null);
    let tag    = (null);
    if(invoice)
    {  
      header = <InjectMessage 
                id="components.TransactionCard.header.tx_date_header"
                values={ {request_id:     utils.trimCenter(invoice.iugu_id.id)
                          , request_date: request_helper.formatDate(invoice.original.created_at_iso)
                          , bold: (str) => <b key={Math.random()}>{str}</b>
                        }} />
      // header = (<>TX #<b>{utils.trimCenter(invoice.iugu_id.id)}</b> • Created on <b>{request_helper.formatDate(invoice.original.created_at_iso)}</b></>);
      tag    = request_helper.iugu.stateTag(invoice);
    }  
    if(invoice)
      
    //
    return(
      <div className="c-header-detail ">
        <div className="c-header-detail__head u-clearfix">
            <div className="c-header-detail__title">
              {header}
            </div>
            <div className="c-header-detail__actions">
              {tag}
            </div>
        </div>
      </div>)
    
    
}

export default connect(
    (state)=> ({
    })
)(IuguHeader)