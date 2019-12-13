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

// import TransactionTypeAndAmount from '@app/components/TransactionCard/type_and_amount';
// import TransactionCard from '@app/components/TransactionCard';
// import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
// import TransactionProfile from '@app/components/TransactionCard/profile';
// import TransactionBankAccount from '@app/components/TransactionCard/bank_account';


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

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }

    const size = 'small'; // 
    const editAccountButton     = (<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_PROFILE_ALIAS, profile)} title="Edit IUGU alias" />)
  
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
                  <TransactionTitle title="IUGU payment alias" button={editAccountButton} />
                  <IuguAlias profile={profile}/>
                </>):(null)}
              <TransactionTitleAndAmount title='Balance'  amount={parseFloat(account.balance).toFixed(2)}/>
              <TransactionTitleAndAmount title='Overdraft'  amount={parseFloat(account.overdraft).toFixed(2)}/>
              <TransactionTitleAndAmount title='Fee'  amount={parseFloat(account.fee).toFixed(2)}/>
              

              
            </div>
        } icon={icon} />
      
    );

    /*
      <TransactionTitle title="Profile Information" button={editProfileButton} />
      <TransactionProfile profile={profile} />
      <TransactionTitle title="Bank Accounts" button={newBankAccountButton} />
      {renderBankAccounts()}
    */
}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(AccountView)

