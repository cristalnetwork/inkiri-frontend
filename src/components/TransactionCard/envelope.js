import React from 'react'
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TransactionEnvelope = ({request}) => {
    const envelope_id = request_helper.envelopeIdFromRequest(request);
    if(!globalCfg.api.isDeposit(request))
        return (null);
    return(
      <div className="ui-list">
        <ul className="ui-list__content">
            <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar">
                      <div className="ui-avatar__content ui-avatar__content--icon">
                        <FontAwesomeIcon icon="envelope" size="lg" color="gray"/>
                      </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                    <div className="ui-info-row__content">
                        <div className="ui-info-row__title">Envelope ID: <b>{envelope_id}</b></div>
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
)(TransactionEnvelope)