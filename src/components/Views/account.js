import React, { useState, useEffect } from 'react';
import { Empty, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Skeleton from '@app/components/Views/skeleton';

import TransactionAccount from '@app/components/TransactionCard/account';
import TransactionTitleAndAmount from '@app/components/TransactionCard/title_amount';
import IuguAlias from '@app/components/TransactionCard/iugu_alias';
import TransactionTitle from '@app/components/TransactionCard/title';

import { injectIntl } from "react-intl";

export const ENUM_EVENT_EDIT_PROFILE_ALIAS      = 'event_edit_profile_alias';

const AccountView = (props) => {
    
    const [account, setAccount]       = useState(null);
    const [profile, setProfile]       = useState(null);
    const [onEvent, setOnEvent]       = useState(null);

    useEffect(() => {
        setAccount(props.account);
        setProfile(props.profile);
        setOnEvent(props.onEvent||null);
    });

    const [edit_iugu_alias_text, setIuguAliasEditText] = useState('');    
    const [iugu_alias, setIugu_alias] = useState('');
    const [balance, setBalance] = useState('');
    const [overdraft, setOverdraft] = useState('');
    const [fee, setFee] = useState('');

    useEffect(() => {
      setIuguAliasEditText(props.intl.formatMessage({id:'components.Views.account.edit_iugu_alias'}));
      setIugu_alias( props.intl.formatMessage({id:'components.Views.account.iugu_alias'}) );
      setBalance( props.intl.formatMessage({id:'components.Views.account.balance'}) );
      setOverdraft( props.intl.formatMessage({id:'components.Views.account.overdraft'}) );
      setFee( props.intl.formatMessage({id:'components.Views.account.fee'}) );
    }, []);

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }

    const size = 'small'; // 
    const editAccountButton     = (<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_PROFILE_ALIAS, profile)} title={edit_iugu_alias_text} />)
  
    //
    if(!account)
      return (null);

    // const icon = profile?((globalCfg.bank.isBusinessAccount(profile))?'store':'user'):'piggy-bank';
    const is_business = (globalCfg.bank.isBusinessAccount(account));
    const icon        = (is_business)?'store':'user';
    return(
      <Skeleton 
        content={
            <div className="c-detail">
              
              <TransactionAccount account={account} />
              {(profile&&is_business)?(
                <>
                  <TransactionTitle title={iugu_alias} button={editAccountButton} />
                  <IuguAlias profile={profile}/>
                </>):(null)}
              <TransactionTitleAndAmount title={balance}    amount={parseFloat(account.balance).toFixed(2)}/>
              <TransactionTitleAndAmount title={overdraft}  amount={parseFloat(account.overdraft).toFixed(2)}/>
              <TransactionTitleAndAmount title={fee}        amount={parseFloat(account.fee).toFixed(2)}/>
              

              
            </div>
        } icon={icon} />
      
    );
}
//
export default connect(
    (state)=> ({
    })
)(injectIntl(AccountView))

