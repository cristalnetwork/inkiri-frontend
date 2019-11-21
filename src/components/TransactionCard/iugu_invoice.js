import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const IuguInvoice = ({invoice}) => {
    //<Icon type="bank" theme="twoTone" style={{fontSize:30}} />
    const _i = invoice.original;
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
                                 <div className="row_name">Customer name</div> 
                                 <div className="row_value">{_i.customer_name}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">Customer email</div> 
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
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(IuguInvoice)