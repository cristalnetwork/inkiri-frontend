import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import TransactionBankAccount from '@app/components/TransactionCard/bank_account';

import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

const TransactionProvider = (props) => {
    
    const [request, setRequest]          = useState(null);
    const [bank_account, setBankAccount] = useState(null);

    useEffect(() => {
        setRequest(props.request);
        // console.log(' >> useEffect >> props.request? : ', props.request);
        if(props.request && props.request.provider && props.request.provider.bank_accounts)
          setBankAccount(props.request.provider.bank_accounts[0]);
        else
          setBankAccount(null);
    });

    if(!request || !bank_account)
      return (null);
    
    return(
      <div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="truck-moving" size="lg" className="icon_color_default"/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{request.provider.name} ({request.provider.cnpj})</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <InjectMessage id="components.TransactionCard.provider.category" />
                                 </div> 
                                 <div className="row_value">{request.provider.category}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">
                                  <InjectMessage id="components.TransactionCard.provider.products_services" />
                                </div> 
                                 <div className="row_value">{request.provider.products_services}</div> 
                              </div>

                              <div className="ui-info-row__details">
                                  <ul>
                                      <li><InjectMessage id="global.provider" /></li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                </li>
                
                <TransactionBankAccount bank_account={bank_account} alone_component={false} />

                <li className="hidden ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="bank" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{bank_account.bank_name}</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <InjectMessage id="components.Forms.bank_account.bank_agency_placeholder" />
                                 </div> 
                                 <div className="row_value">{bank_account.agency}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">
                                  <InjectMessage id="components.Forms.bank_account.bank_cc_placeholder" />
                                </div> 
                                 <div className="row_value">{bank_account.cc}</div> 
                              </div>
                          </div>
                      </div>
                </li>
                <li className="ui-row ui-action-row ui-action-row--no-truncate">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="shopping" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-action-row__content">
                              <div className="ui-action-row__title u-truncate" title={props.intl.formatMessage({id:'global.description'})}>
                                {request.description || props.intl.formatMessage({id:'components.TransactionCard.provider.product_service_n_a'})}
                              </div>
                          </div>
                      </div>
                </li>

                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="unordered-list" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">
                                <InjectMessage id="components.TransactionCard.provider.payment_details" />
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name"><InjectMessage id="components.TransactionCard.provider.payment_vehicle" /></div> 
                                 <div className="row_value">{request.provider_extra.payment_vehicle}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <div className="row_name">
                                     <InjectMessage id="components.TransactionCard.provider.payment_category" />
                                   </div> 
                                 </div> 
                                 <div className="row_value">{request.provider_extra.payment_category}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <InjectMessage id="components.TransactionCard.provider.payment_type" />
                                 </div> 
                                 <div className="row_value">{request.provider_extra.payment_type}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">
                                   <InjectMessage id="components.TransactionCard.provider.payment_mode" />
                                 </div> 
                                 <div className="row_value">{request.provider_extra.payment_mode}</div> 
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
)(injectIntl(TransactionProvider))