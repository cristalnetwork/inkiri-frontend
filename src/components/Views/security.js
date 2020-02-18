import React, { useState, useEffect } from 'react';
import { Empty, Button } from 'antd';
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';

import Skeleton from '@app/components/Views/skeleton';

import TransactionTitle from '@app/components/TransactionCard/title';
import AccountBlockchainLink from '@app/components/TransactionCard/account_blockchain_link';
import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

export const ENUM_EVENT_EDIT_KEY      = 'event_edit_key';

const Security = (props) => {
    
    const [profile, setProfile]        = useState(null);
    const [onEvent, setOnEvent]        = useState(true);
    const [eos_account, setEosAccount] = useState(props.eos_account);
    
    useEffect(() => {
        setProfile(props.profile);
    }, [props.profile]);

    useEffect(() => {
        setEosAccount(props.eos_account);
    }, [props.eos_account]);

    const fireEvent = (eventType, object) => {
      if(typeof props.onEvent === 'function') {
          props.onEvent(eventType, object)
      }
    }

    const [title_text,    setTitleText]                           = useState('');
    const [edit_text,     setEditText]                            = useState('');
    const [change_password_text, setChangePasswordText]           = useState('');
    const [current_key_text, setCurrentKeyText]                   = useState('');
    const [account_explorer_link_text, setAccounExplorerLinkText] = useState('');
    useEffect(() => {
      setEditText( props.intl.formatMessage({id:'components.Views.profile_security.update_key'}) );
      setCurrentKeyText( props.intl.formatMessage({id:'components.Views.profile_security.current_key'}));
      setTitleText( props.intl.formatMessage({id:'components.Views.profile_security.title'}));
      setAccounExplorerLinkText( props.intl.formatMessage({id:'components.Views.profile_security.account_blockchain_link_text'}));
      setChangePasswordText( props.intl.formatMessage({id:'components.Views.profile_security.change_password_action_text'}));
    }, []);


    const editKeyButton     = (<Button type="default" icon="edit" size="small" onClick={() => fireEvent(ENUM_EVENT_EDIT_KEY, profile)} title={edit_text}>{change_password_text}</Button>)
    //
    
    if(!profile)
      return (null);
    
    const getKey = () => {
      return eos_account.permissions.filter(perm => perm.perm_name=='owner')[0].required_auth.keys[0].key
    }
    return(
      <Skeleton 
        title={title_text}
        content={
            <div className="c-detail">
              <TransactionTitle title={`${current_key_text}: ${getKey()}`} button={editKeyButton} />
              <AccountBlockchainLink title={account_explorer_link_text} account_name={profile.account_name} />
            </div>
        } icon="shield-alt" />);
//`
}
//
export default connect(
    (state)=> ({
        // allAccounts:       loginRedux.allAccounts(state),
        // actualAccountName: loginRedux.actualAccountName(state),
        // currentAccount:    loginRedux.currentAccount(state),
        // isLoading:         loginRedux.isLoading(state)
    })
)(injectIntl(Security))

