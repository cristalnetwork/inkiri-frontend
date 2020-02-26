import React from 'react';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as globalCfg from '@app/configs/global';

const AccountBlockchainLink = ({account_name, title, size}) => {
    
    if(!account_name)
      return (null);
    
    const url = globalCfg.dfuse.account_url;
    const _id = globalCfg.dfuse.account_keys_url_postfix;
    const href = `${url}${account_name}${_id}`;
    
    return (<div className="ui-list shorter">
              <a className="ui-row ui-info-row ui-info-row--medium" href={href} target="_blank">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar ">
                        <div className="ui-avatar__content ui-avatar__content--icon">
                          <FontAwesomeIcon icon="cloud" className="icon_color_green"/>
                        </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                  <div className="ui-info-row__content">
                        {title}
                  </div>
                </div>
                <div className="ui-row__col ui-row__col--actions">
                    <FontAwesomeIcon icon="external-link-alt"  color="gray"/>
                </div>
            </a>
          </div>);
}
//
export default (AccountBlockchainLink)