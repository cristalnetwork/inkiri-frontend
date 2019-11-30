import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ItemAmount from '@app/components/TransactionCard/item_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';

const ServiceCard = (props) => {
    
    const [provider, setProvider]     = useState(null);
    const [service, setService]       = useState(null);
    const [actualAccountName, setAcc] = useState(null);

    useEffect(() => {
        setProvider(props.provider);
        setService(props.service);
        setAcc(props.actualAccountName);
    });
    if(!service)
      return (null);
    let _provider = (null);
    if(provider && provider.account_name==actualAccountName)
    {
      _provider  = (<TransactionPetitioner profile={provider} title="Provided by"/>)
    }
    return (
      <div className="c-detail_small">
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
                                          {service.title}

                                          <div className="ui-info-row__details">
                                            <ul><li>{service.description}</li></ul>
                                          </div>

                                        </div>
                                        <div className="c-ticket__amount ">
                                          <ItemAmount amount={parseFloat(service.amount).toFixed(2)} />
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
        {_provider}
      </div>);
    
    
}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(ServiceCard)