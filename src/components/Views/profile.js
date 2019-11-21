import React, { useState, useEffect } from 'react';
import { Empty, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
// import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Skeleton from '@app/components/Views/skeleton';

import TransactionCard from '@app/components/TransactionCard';
import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import TransactionProfile from '@app/components/TransactionCard/profile';
import TransactionBankAccount from '@app/components/TransactionCard/bank_account';
import TransactionTitle from '@app/components/TransactionCard/title';

export const ENUM_EVENT_EDIT_PROFILE      = 'event_edit_profile';
export const ENUM_EVENT_EDIT_BANK_ACCOUNT = 'event_edit_bank_account';
export const ENUM_EVENT_NEW_BANK_ACCOUNT  = 'event_new_bank_account';

const ConfigurationProfile = (props) => {
    
    const [profile, setProfile]       = useState(null);
    const [onEvent, setOnEvent]       = useState(true);

    useEffect(() => {
        setProfile(props.profile);
        setOnEvent(props.onEvent||null);
    });

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }

    const size = 'small'; // 
    const editProfileButton     = (<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_PROFILE, profile)} title="Edit profile information" />)
    const newBankAccountButton  = (<Button type="default" icon="plus" size={size} onClick={() => fireEvent(ENUM_EVENT_NEW_BANK_ACCOUNT, null)} title="Add new bank account" />)
    
    const printAddress = () => {
      return Object.values(profile.address).join(', ')
    }
    const profileName  = () => {
      if(profile.account_type=='business')
        return profile.business_name;
      return profile.first_name + ' ' + profile.last_name;
    }

    const renderBankAccounts = () => {
      if(!profile || !profile.bank_accounts || profile.bank_accounts.length<=0)
      {
        const emptyBankAccount = (
          <div className="ui-list">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} imageStyle={{height: 40}}description={<span>No bank accounts added yet.</span>} />
          </div>)
        // const emptyBankAccount = (<Empty />)

        return emptyBankAccount;
      }

      return (<>{profile.bank_accounts.map(
          bank_account => <TransactionBankAccount 
            key={'bank_account_'+bank_account._id}
            bank_account={bank_account} 
            alone_component={false} 
            button={<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_BANK_ACCOUNT, bank_account)} title="Edit bank account information" />} 
          />)
        }</>);
    }
    //
    if(!profile)
      return (null);
    
    if(globalCfg.bank.isBusinessAccount(profile))
      return(
        <Skeleton 
          content={
              <div className="c-detail">
                <TransactionPetitioner profile={profile} title="Business name" />
                <TransactionTitle title="Profile Information" button={editProfileButton} />
                <TransactionProfile profile={profile} />
              </div>
          } icon="store" />);

    if(globalCfg.bank.isPersonalAccount(profile))
      return(
        <Skeleton 
          content={
              <div className="c-detail">
                <TransactionPetitioner profile={profile} title="Nome y Sobrenome" />
                <TransactionTitle title="Profile Information" button={editProfileButton} />
                <TransactionProfile profile={profile} />
                <TransactionTitle title="Bank Accounts" button={newBankAccountButton} />
                {renderBankAccounts()}
              </div>
          } icon="user" />);
}
//
export default connect(
    (state)=> ({
        // allAccounts:       loginRedux.allAccounts(state),
        // actualAccountName: loginRedux.actualAccountName(state),
        // currentAccount:    loginRedux.currentAccount(state),
        // isLoading:         loginRedux.isLoading(state)
    })
)(ConfigurationProfile)

