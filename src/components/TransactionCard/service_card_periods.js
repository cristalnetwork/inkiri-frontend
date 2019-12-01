import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import * as form_helper from '@app/components/Form/form_helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as moment from 'moment';

const ServiceCardPeriods = (props) => {
    
    const [service_extra, setServiceExtra]     = useState(null);
    const [price, setPrice]                    = useState(0.0);
    const [alone_component, setAloneComponent] = useState(false);
    useEffect(() => {
        setServiceExtra(props.service_extra);
        setPrice(props.price);
    });

    if(!service_extra)
      return (null);

    const begins_at       = moment(service_extra.begins_at);
    const begins_at_text  = begins_at.format(form_helper.MONTH_FORMAT_HUMANIZED);

    const expires_at      = moment(service_extra.expires_at);
    const expires_at_text = expires_at.format(form_helper.MONTH_FORMAT_HUMANIZED);

    const periods         = expires_at.diff(begins_at, 'months')+1;
    const total_amount    = globalCfg.currency.toCurrencyString(price*periods);

    const item = (<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="calendar-alt" size="lg" color="gray"/>
                            </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">From {begins_at_text} <Icon type="caret-right" /> to {expires_at_text}</div>
                              
                              <div className="hidden ui-info-row__title name_value_row">
                                 <div className="row_name">Begins at</div> 
                                 <div className="row_value">{begins_at_text}</div> 
                              </div>
                              <div className="hidden  ui-info-row__title name_value_row">
                                <div className="row_name">Expires at</div> 
                                 <div className="row_value">{expires_at_text}</div> 
                              </div>
                              <div className="ui-info-row__title name_value_row">
                                <div className="row_name">Total periods</div> 
                                 <div className="row_value">{periods}</div> 
                              </div>
                              <div className="ui-info-row__title name_value_row">
                                <div className="row_name">Total contract price</div> 
                                 <div className="row_value">{total_amount}</div> 
                              </div>
                          </div>
                      </div>
                </li>);
    if(!alone_component)
      return item;
    return(
      <div className="ui-list">
        <ul className="ui-list__content">
          {item}        
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
)(ServiceCardPeriods)