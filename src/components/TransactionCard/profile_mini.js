import React from 'react'
import { connect } from 'react-redux'
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ProfileMini = ({profile, title, not_alone, gray_bg}) => {
      
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
    })
)(ProfileMini)