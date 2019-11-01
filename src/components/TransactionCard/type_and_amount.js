import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';

import * as request_helper from '@app/components/TransactionCard/helper';

const TransactionTypeAndAmount = ({request}) => {
    
    return(
      <div className="ui-list">
          <ul className="ui-list__content">
              <li>
                  <div className="c-ticket ">
                      <ul>
                          <li className="c-ticket__section ">
                              <ul>
                                  <li className="c-ticket__item c-ticket-subtotal">
                                      <div className="c-ticket__row">
                                        <div className="c-ticket__title request_details_title">
                                          {globalCfg.api.typeToText(request.requested_type).toUpperCase()} <small>request</small>
                                        </div>
                                        <div className="c-ticket__amount ">
                                          <span className="price-tag price-tag-billing">
                                            <span className="price-tag price-tag-symbol-text hidden">
                                              {globalCfg.currency.fiat.plural}
                                            </span>
                                            <span className="price-tag price-tag-symbol">
                                              {globalCfg.currency.fiat.symbol} 
                                            </span>
                                            <span className="price-tag price-tag-fraction">
                                              {request.amount}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                  </li>
                              </ul>
                          </li>
                      </ul>
                  </div>
              </li>
          </ul>
      </div>  
    )
    
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TransactionTypeAndAmount)