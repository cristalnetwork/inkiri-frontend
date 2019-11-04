import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import TransactionTitle from '@app/components/TransactionCard/title';

const TransactionBlockchain = (props) => {
    
    const [request, setRequest]          = useState(props.request);    

    useEffect(() => {
      setRequest(props.request);
    });

    const blockchainLink = (tx_id, title) => {
      if(!tx_id)
        return (null);
      const link = request_helper.getBlockchainLink(tx_id, false, 'large', title);
      return (<li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar ">
                        <div className="ui-avatar__content ui-avatar__content--icon">
                          <FontAwesomeIcon icon="cloud" size="2x" className="icon_color_green"/>
                        </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                  <div className="ui-info-row__content">
                      <div className="ui-info-row__title">
                        {link}
                      </div>
                  </div>
                </div>
                <div className="ui-row__col ui-row__col--actions">
                    <FontAwesomeIcon icon="chevron-right"  color="gray"/>
                </div>
            </li>);
    }

    if(!request || (!request.tx_id && !request.refund_tx_id))
      return (null);
    
    return( <>
        <TransactionTitle title="Blobkchain" />
        
        <div className="ui-list">
          <ul className="ui-list__content">
            {blockchainLink(request.tx_id, 'Customer payment')}
            {blockchainLink(request.refund_tx_id, 'Bank refund')}
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