import React from 'react'
import { connect } from 'react-redux'
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import InjectMessage from "@app/components/intl-messages";

const TransactionPetitioner = ({profile, title, not_alone}) => {
    
    const item = (<>
                  <div className="ui-row__col ui-row__col--heading">
                      <div className="ui-avatar">
                        <div className="ui-avatar__content ui-avatar__content--initials">
                          <span>{utils.firsts(profile.account_name, 1).toUpperCase()}</span>
                        </div>
                      </div>
                  </div>
                  <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">{title}:&nbsp;<b>{request_helper.getProfileName(profile)}</b></div>
                            <div className="ui-info-row__details">
                                <ul>
                                    <li><InjectMessage id="global.account_name" />: @{profile.account_name}</li>
                                </ul>
                            </div>
                      </div>
                  </div>
                </>);
    //
    if(not_alone===true)
      return (item);

    return(
        <div className="ui-list">
          <ul className="ui-list__content">
            <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
              {item}
            </li>
          </ul>
        </div>
      );
    //
    
}

export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TransactionPetitioner)