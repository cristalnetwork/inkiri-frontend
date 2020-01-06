import React, { useState, useEffect } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux'

import ItemAmount from '@app/components/TransactionCard/item_amount';

import InjectMessage from "@app/components/intl-messages";

const TxOperation = (props) => {
    
    const [operation, setOperation]       = useState(null);
    
    useEffect(() => {
        setOperation(props.operation);
    }, [props.operation]);

    if(!operation)
      return (null);
    const amount      = (<ItemAmount amount={operation.amount} small={true} />);
    
    return (<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
              <div className="ui-row__col ui-row__col--heading">
                  <div className="ui-avatar">
                      <div className="ui-avatar__content ui-avatar__content--icon">
                        <Icon type="info-circle" theme="twoTone" style={{fontSize:30}} />
                      </div>
                  </div>
              </div>
              <div className="ui-row__col ui-row__col--content">
                  <div className="c-ticket ">
                      <ul>
                          <li className="c-ticket__section ">
                              <ul>
                                  <li className="c-ticket__item c-ticket-subtotal">
                                      <div className="c-ticket__row">
                                        <div className="c-ticket__title ">
                                          {operation.sub_header}
                                          <div className="ui-info-row__details name_value_row">
                                             <div className="row_name">
                                               <InjectMessage id="components.TransactionCard.tx_operation.from_sender" />
                                             </div> 
                                             <div className="row_value">{operation.from}</div> 
                                          </div>
                                          <div className="ui-info-row__details name_value_row">
                                            <div className="row_name">
                                              <InjectMessage id="components.TransactionCard.tx_operation.to_receiver" />
                                            </div> 
                                            <div className="row_value">{operation.to}</div> 
                                          </div>
                                        </div>
                                        <div className="c-ticket__amount ">
                                          {amount}
                                        </div>
                                      </div>
                                  </li>
                              </ul>
                          </li>
                      </ul>
                  </div>
              </div>
          </li>);

}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TxOperation)