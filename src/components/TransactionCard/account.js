import React from 'react'
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import InjectMessage from "@app/components/intl-messages";

const TransactionAccount = ({account}) => {
    
    return(
      <div className="ui-list">
        <ul className="ui-list__content">
            <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      <div className="ui-avatar__content ui-avatar__content--initials">
                        <span>{utils.firsts(account.account_name||account.key, 1).toUpperCase()}</span>
                      </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                    <div className="ui-info-row__content">
                        <div className="ui-info-row__title"><InjectMessage id="global.account_name" />:&nbsp;<b>{account.account_name||account.key}</b></div>
                          <div className="ui-info-row__details">
                              <ul>
                                  <li><InjectMessage id="global.account_type" />: @{globalCfg.bank.getAccountType(account.account_type)}</li>
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
    })
)(TransactionAccount)