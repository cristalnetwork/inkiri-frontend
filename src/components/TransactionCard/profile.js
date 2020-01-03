import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InjectMessage from "@app/components/intl-messages";

const TransactionProfile = ({profile}) => {
    
    const printAddress = () => {
      if(profile.address)
        return Object.values(profile.address).join(', ')
      return <InjectMessage id="global.no_data" />
    }

    const is_business = globalCfg.bank.isBusinessAccount(profile);
    const hidden_text = is_business?' hidden ':'';
    return(
      <div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="envelope" size="lg" className="icon_color_default"/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__label"><InjectMessage id="components.Forms.profile.email_desc" /></div>
                              <div className="ui-info-row__title">{profile.email}</div>
                          </div>
                      </div>
                </li>
                
                
                
                
                <li className={"ui-row ui-info-row ui-info-row--medium ui-info-row" + hidden_text}>
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="id-card" size="lg" className="icon_color_default"/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__label"><InjectMessage id="components.Forms.profile.cpf_desc" /></div>
                              <div className="ui-info-row__title">{profile.legal_id}</div>
                          </div>
                      </div>
                </li>

                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="phone" size="lg" className="icon_color_default"/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__label"><InjectMessage id="components.Forms.profile.phone_desc" /></div>
                              <div className="ui-info-row__title">{profile.phone}</div>
                          </div>
                      </div>
                </li>
                
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="map-marker-alt" size="lg" className="icon_color_default"/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__label"><InjectMessage id="components.Forms.profile.address_desc" /></div>
                              <div className="ui-info-row__title">{printAddress()}</div>
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
)(TransactionProfile)