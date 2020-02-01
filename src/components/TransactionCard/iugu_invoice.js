import React from 'react';
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InjectMessage from "@app/components/intl-messages";

const IuguInvoice = ({invoice}) => {
    const _i = (typeof invoice.original == 'string')
      ?JSON.parse(invoice.original)
      :invoice.original;
    return(
      <div className="ui-list">
          <ul className="ui-list__content">
                
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <FontAwesomeIcon icon="receipt" size="2x" className="icon_color_default"/>
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{_i.items[0].description}</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <InjectMessage id="components.iugu_invoice.customer_name"/>
                                 </div> 
                                 <div className="row_value">{_i.customer_name}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">
                                  <InjectMessage id="components.iugu_invoice.customer_email"/>
                                </div> 
                                <div className="row_value">{_i.email}</div> 
                              </div>
                          </div>
                      </div>
                </li>

          </ul>
      </div>
    )
    
}
//
export default connect(
    (state)=> ({
    })
)(IuguInvoice)