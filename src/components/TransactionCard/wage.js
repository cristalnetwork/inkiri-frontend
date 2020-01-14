import React, { useState, useEffect } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux'

import ItemAmount from '@app/components/TransactionCard/item_amount';
import * as request_helper from '@app/components/TransactionCard/helper';
import InjectMessage from "@app/components/intl-messages";

const Wage = (props) => {
    
    const [wage, setWage]       = useState(null);
    
    useEffect(() => {
        setWage(props.wage);
    }, [props.wage]);

    if(!wage)
      return (null);
    const amount      = (<ItemAmount amount={wage.wage} small={true} />);
    
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
                                          
                                          <div className="ui-info-row__details name_value_row">
                                            <div className="row_name">
                                              <InjectMessage id="components.TransactionCard.wage.member" />
                                            </div> 
                                            <div className="row_value bold">
                                              {request_helper.getProfileName(wage.member)}<br/>
                                              <br/>@{wage.account_name}
                                            </div> 
                                          </div>

                                          <div className="ui-info-row__details name_value_row">
                                            <div className="row_name">
                                              <InjectMessage id="components.TransactionCard.wage.position" />
                                            </div> 
                                            <div className="row_value bold">{wage.position}</div> 
                                          </div>

                                          <div className="ui-info-row__details name_value_row">
                                            <div className="row_name">
                                              <InjectMessage id="components.TransactionCard.wage.description" />
                                            </div> 
                                            <div className="row_value bold">{wage.description}</div> 
                                          </div>

                                          <div className="ui-info-row__details name_value_row">
                                            <div className="row_name">
                                              <InjectMessage id="components.TransactionCard.wage.period" />
                                            </div> 
                                            <div className="row_value bold">{wage.period}</div> 
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
)(Wage)