import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
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
                          , bold: (str) => <b>{str}</b>
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
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(IuguHeader)