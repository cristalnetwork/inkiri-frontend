import React from 'react'
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';
import ItemAmount from '@app/components/TransactionCard/item_amount';

const TransactionTitleAndAmount = ({title, amount}) => {
    
    const description = (<>{title}</>);
    //
    const my_amount   = (<ItemAmount amount={amount} symbol={globalCfg.currency.eos_symbol} small={true}/>);
    //

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
                                        <div className="c-ticket__title c-ticket__title_small request_details_title">
                                          {description}
                                        </div>
                                        <div className="c-ticket__amount ">
                                          {my_amount}
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
    })
)(TransactionTitleAndAmount)