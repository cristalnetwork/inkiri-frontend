import React from 'react';
import { Alert } from 'antd';
import { connect } from 'react-redux'
import IuguIconImage from '@app/components/TransactionCard/iugu_icon';

import { injectIntl } from "react-intl";

const IuguAlias = ({profile, alone_component, intl}) => {
    
    const _alias = (profile && profile.alias)?profile.alias:( <Alert
      message={intl.formatMessage({id:'components.TransactionCard.iugu_alias.alias_not_set_error'})}
      type="warning"
      showIcon
    />);

    const item = (<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              {IuguIconImage}
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{_alias}</div>
                          </div>
                      </div>
                </li>);
    //
    if(alone_component!==undefined && alone_component===false)
      return item;
    
    return(
      <div className="ui-list">
          <ul className="ui-list__content">
                {item}
          </ul>
      </div>
    )
    
}
//
export default connect(
    (state)=> ({
    })
)( injectIntl(IuguAlias))