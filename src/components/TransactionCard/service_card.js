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

                                          <div class="ui-info-row__details">
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
    //
    // const item = (
    //   <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
    //       <div style={{position:'absolute', right:'10px', top:'10px'}}>{edit_button}</div>
    //       <div className="ui-row__col ui-row__col--heading">
    //           <div className="ui-avatar ">
    //               <div className="ui-avatar__content ui-avatar__content--icon">
    //                 <Icon type="bank" theme="twoTone" style={{fontSize:30}} />
    //               </div>
    //           </div>
    //       </div>
    //       <div className="ui-row__col ui-row__col--content">
    //           <div className="ui-info-row__content">
    //               <div className="ui-info-row__title">{bank_account.bank_name}</div>
    //               <div className="ui-info-row__details name_value_row">
    //                  <div className="row_name">Agency</div> 
    //                  <div className="row_value">{bank_account.agency}</div> 
    //               </div>
    //               <div className="ui-info-row__details name_value_row">
    //                 <div className="row_name">CC</div> 
    //                  <div className="row_value">{bank_account.cc}</div> 
    //               </div>
    //           </div>
    //       </div>
    //   </li>);
    //
    // if(!alone_component)
    //   return item;
    // return(
    //   <div className="ui-list">
    //     <ul className="ui-list__content">
    //       {item}        
    //     </ul>
    //   </div>
    // )


    
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