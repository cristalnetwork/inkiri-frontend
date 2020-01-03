import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import ItemAmount from '@app/components/TransactionCard/item_amount';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import ServiceCardPeriods from '@app/components/TransactionCard/service_card_periods'
import { injectIntl } from "react-intl";

const ServiceCard = (props) => {
    
    const [provider, setProvider]       = useState(null);
    const [service, setService]         = useState(null);
    const [actualAccountName, setAcc]   = useState(null);
    const [smallStyle, setSmallStyle]   = useState(false);
    const [request, setRequest]         = useState(null);


    useEffect(() => {
        setProvider(props.provider);
        setService(props.service);
        setAcc(props.actualAccountName);
        setSmallStyle(props.smallStyle);
        setRequest(props.request||null);
    });

    if(!service && !request)
      return (null);

    const _service       = service || ((request)?request.service:null);
    
    const _provider      = provider || ((request)?request.requested_by:null);
    let _provider_widget = null;
    if(_provider && _provider.account_name!=actualAccountName)
    {
      _provider_widget  = (<TransactionPetitioner profile={_provider} title={props.intl.formatMessage({id:'global.provided_by'})} not_alone={true}/>)
    }

    const _customer       = (request)?request.requested_to:null;
    let _customer_widget  = null;
    if(_customer && _customer.account_name!=actualAccountName)
    {
      _customer_widget  = (<TransactionPetitioner profile={_customer} title={props.intl.formatMessage({id:'global.requested_to'})} not_alone={true}/>)
    }

    const _service_extra  = (request)?request.service_extra:null;
    let _periods  = null;
    if(_service_extra)
    {
      _periods  = (<ServiceCardPeriods service_extra={_service_extra} price={_service.amount}/>)
    }

    const class_name = (smallStyle)?'_small':'';
    return (
      <div className={`c-detail${class_name}`}>
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
                                          {_service.title}
                                          <div className="ui-info-row__details">
                                            <ul><li>{_service.description}</li></ul>
                                          </div>
                                        </div>
                                        <div className="c-ticket__amount ">
                                          <ItemAmount amount={parseFloat(_service.amount).toFixed(2)} />
                                        </div>
                                      </div>
                                  </li>
                              </ul>
                          </li>
                      </ul>
                  </div>
              </li>
              
              {_provider_widget
                ?(<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                  {_provider_widget}
                </li>)
                :(null)
              }

              {_customer_widget
                ?(<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                  {_customer_widget}
                </li>)
                :(null)
              }
              
              {_periods
                ?(_periods)
                :(null)
              }
              
          </ul>
        </div>  
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
)( injectIntl(ServiceCard))