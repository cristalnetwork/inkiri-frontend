import React, { useState, useEffect } from 'react';
import { Empty, Button } from 'antd';
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';

import Skeleton from '@app/components/Views/skeleton';

import TransactionPetitioner from '@app/components/TransactionCard/petitioner';
import TransactionProfile from '@app/components/TransactionCard/profile';
import TransactionBankAccount from '@app/components/TransactionCard/bank_account';
import TransactionTitle from '@app/components/TransactionCard/title';

import InjectMessage from "@app/components/intl-messages";
import { injectIntl } from "react-intl";

export const ENUM_EVENT_EDIT_PROFILE      = 'event_edit_profile';
export const ENUM_EVENT_EDIT_BANK_ACCOUNT = 'event_edit_bank_account';
export const ENUM_EVENT_NEW_BANK_ACCOUNT  = 'event_new_bank_account';

const ConfigurationProfile = (props) => {
    
    const [profile, setProfile]       = useState(null);
    const [onEvent, setOnEvent]       = useState(true);

    useEffect(() => {
        setProfile(props.profile);
    }, [props.profile]);

    useEffect(() => {
        setOnEvent(props.onEvent);
    }, [props.onEvent]);

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }

    const [edit_text,     setEditText]       = useState('');
    const [add_bank_text, setAddBankText]    = useState('');
    const [edit_bank_text, setEditBankText]  = useState('');
    const [fund_name, setFund_name]          = useState('');
    const [profile_info, setProfile_info]    = useState('');
    const [business_name, setBusiness_name]  = useState('');
    const [full_name, setFull_name]          = useState('');
    const [bank_accounts, setBank_accounts]  = useState('');
    useEffect(() => {
      setEditText( props.intl.formatMessage({id:'components.Views.profile.edit_text'}) );
      setAddBankText( props.intl.formatMessage({id:'components.Views.profile.add_bank_text'}) );
      setEditBankText( props.intl.formatMessage({id:'components.Views.profile.edit_bank_text'}) );
      setFund_name( props.intl.formatMessage({id:'components.Views.profile.fund_name'}));
      setProfile_info( props.intl.formatMessage({id:'components.Views.profile.profile_info'}));
      setBusiness_name( props.intl.formatMessage({id:'components.Views.profile.business_name'}));
      setFull_name( props.intl.formatMessage({id:'components.Views.profile.full_name'}));
      setBank_accounts( props.intl.formatMessage({id:'components.Views.profile.bank_accounts'}));
    }, []);


    const size = 'small'; //   
    const editProfileButton     = (<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_PROFILE, profile)} title={edit_text} />)
    const newBankAccountButton  = (<Button type="default" icon="plus" size={size} onClick={() => fireEvent(ENUM_EVENT_NEW_BANK_ACCOUNT, null)} title={add_bank_text} />)
    
    // const printAddress = () => {
    //   return Object.values(profile.address).join(', ')
    // }
    // const profileName  = () => {
    //   if(profile.account_type=='business')
    //     return profile.business_name;
    //   return profile.first_name + ' ' + profile.last_name;
    // }

    const renderBankAccounts = () => {
      if(!profile || !profile.bank_accounts || profile.bank_accounts.length<=0)
      {
        const emptyBankAccount = (
          <div className="ui-list">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} imageStyle={{height: 40}} description={<InjectMessage id="components.Views.profile.no_banks_added_yet" />} />
          </div>)
        //
        return emptyBankAccount;
      }

      return (<>{profile.bank_accounts.map(
          bank_account => <TransactionBankAccount 
                            key={'bank_account_'+bank_account._id}
                            bank_account={bank_account} 
                            alone_component={false} 
                            button={<Button type="default" icon="edit" size={size} onClick={() => fireEvent(ENUM_EVENT_EDIT_BANK_ACCOUNT, bank_account)} title={edit_bank_text} />} 
          />)
        }</>);
    }
    //
    if(!profile)
      return (null);
    
    const title = props.intl.formatMessage({id:'pages.bankadmin.profile.tab.profile'})
    if(globalCfg.bank.isFoundationAccount(profile))
      return(
        <Skeleton
          title={title} 
          content={
              <div className="c-detail">
                <TransactionPetitioner profile={profile} title={fund_name} />
                <TransactionTitle title={profile_info} button={editProfileButton} />
                <TransactionProfile profile={profile} />
              </div>
          } icon="home" />);

    if(globalCfg.bank.isBusinessAccount(profile))
      return(
        <Skeleton 
          title={title} 
          content={
              <div className="c-detail">
                <TransactionPetitioner profile={profile} title={business_name} />
                <TransactionTitle title={profile_info} button={editProfileButton} />
                <TransactionProfile profile={profile} />
              </div>
          } icon="store" />);


    if(globalCfg.bank.isPersonalAccount(profile))
      return(
        <Skeleton
          title={title}  
          content={
              <div className="c-detail">
                <TransactionPetitioner profile={profile} title={full_name} />
                <TransactionTitle title={profile_info} button={editProfileButton} />
                <TransactionProfile profile={profile} />
                <TransactionTitle title={bank_accounts} button={newBankAccountButton} />
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
)(injectIntl(ConfigurationProfile))

