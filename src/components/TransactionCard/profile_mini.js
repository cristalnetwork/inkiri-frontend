import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ProfileMini = ({profile, title, not_alone, gray_bg}) => {
      
    /*
    <div className="ui-avatar">
                        <div className="ui-avatar__content ui-avatar__content--initials">
                          <FontAwesomeIcon icon="user" size="lg" color="gray"/>
                        </div>
                      </div>
                      */
    const gray_bg_classname = gray_bg===true?' ui-info-row--background-gray ':' ui-info-row ';
    const item = (<>
                  <div className="ui-row__col ui-row__col--heading">
                      <div className="badge badge-extra-small badge-circle addresse-avatar ">
                        <span className="picture">
                          <FontAwesomeIcon icon="user" size="lg" color="black"/>
                        </span>
                      </div>
                  </div>
                  <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">
                            {title||'Customer' }:&nbsp;<b>{request_helper.getProfileName(profile)}</b>
                          </div>
                          <div className="ui-info-row__details">
                              <ul>
                                  <li>@{profile.account_name}</li>
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
            <li className={`ui-row ui-info-row ui-info-row--medium ${gray_bg_classname}`} >
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
)(ProfileMini)