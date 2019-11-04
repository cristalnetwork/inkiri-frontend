import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';

const TransactionPetitioner = ({profile, title}) => {
    
    const petitionerName = () => {
      if(profile.account_type=='business')
        return profile.business_name;
      return profile.first_name + ' ' + profile.last_name;
    }
    return(
      <div className="ui-list">
        <ul className="ui-list__content">
            <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      <div className="ui-avatar__content ui-avatar__content--initials">
                        <span>{utils.firsts(profile.account_name, 1)}</span>
                      </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                    <div className="ui-info-row__content">
                        <div className="ui-info-row__title">{title||'Requested by' }:&nbsp;<b>{petitionerName()}</b></div>
                          <div className="ui-info-row__details">
                              <ul>
                                  <li>Account name: @{profile.account_name}</li>
                              </ul>
                          </div>
                    </div>
                </div>
            </li>
        </ul>
      </div>
    )
    
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TransactionPetitioner)