import React, { useState, useEffect } from 'react';
import { Modal, Skeleton, List, Card, Button, Icon } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

// import Skeleton from '@app/components/Views/skeleton';
export const ENUM_EVENT_NEW_PERMISSION      = 'event_new_permission';
export const ENUM_EVENT_DELETE_PERMISSION   = 'event_delete_permission';
export const ENUM_EVENT_RELOAD_PERMISSIONS  = 'event_reload_permissions';
export const ENUM_AUTHORITY_CHANGE          = 'event_authority_change';

const AccountRolesView = (props) => {
    
    const [loading, setLoading]        = useState(props.loading);
    const [account, setAccount]        = useState(props.account);
    const [eos_account, setEosAccount] = useState(props.eos_account);
    const [authority, setAuthority]    = useState(props.authority||'owner');
    const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    const [onEvent, setOnEvent]        = useState(props.onEvent);    

    useEffect(() => {
        setOnEvent(props.onEvent);
    }, [props.onEvent]);

    useEffect(() => {
        setAccount(props.account);
    }, [props.account]);

    useEffect(() => {
        setEosAccount(props.eos_account);
    }, [props.eos_account]);

    useEffect(() => {
        setLoading(props.loading);
    }, [props.loading]);

    useEffect(() => {
        setAuthority(props.authority);
    }, [props.authority]);

    useEffect(() => {
        setIsAdmin(props.isAdmin);
    }, [props.isAdmin]);

    const [confirm_role_delete, setConfirm_role_delete]  = useState('');
    const [delete_text, setDeleteText]  = useState('');
    const [new_text, setNewText]  = useState('');
    const [reload_text, setReloadText]  = useState('');
    useEffect(() => {
      setConfirm_role_delete( props.intl.formatMessage({id:'components.Views.roles.delete_role'}) );
      setDeleteText( props.intl.formatMessage({id:'components.Views.roles.delete'}) );
      setNewText( props.intl.formatMessage({id:'components.Views.roles.new'}) );
      setReloadText( props.intl.formatMessage({id:'components.Views.roles.reload'}) );
    }, []);

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }
    const tabChange = (authority) => {
      fireEvent(ENUM_AUTHORITY_CHANGE, authority); 
    }

    // content: (<p>You are about to remove <b>{permission_actor}@{permission_permission}</b> from <b>{account.key}</b> <i>{permission_name}</i> authority's list. Continue or cancel.</p>),
        
    const onDeletePermission = (permission_name, permission_actor, permission_permission ) => {
      Modal.confirm({
        title: confirm_role_delete
        , content: (<InjectMessage 
                      id="components.Views.roles.delete_role_message"
                      values={ {
                                permission_actor:         permission_actor
                                , permission_permission:  permission_permission
                                , account_key:            account.key
                                , permission_name:        permission_name
                                , bold: (str) => <b>{str}</b>
                                , italic: (str) => <i>{str}</i>
                        }} />)
        , onOk() {
          fireEvent(ENUM_EVENT_DELETE_PERMISSION, 
          {
            permission: {
              name: permission_name, 
              actor: permission_actor, 
              permission : permission_permission
            }
          });          
        }
        , onCancel() {},
      });

    }

    const onNewPermission = () => {
      fireEvent(ENUM_EVENT_NEW_PERMISSION, authority);
    }
    
    const onReloadPermission = () => {
      console.log(' roles-view::about to fire ENUM_EVENT_RELOAD_PERMISSIONS')
      fireEvent(ENUM_EVENT_RELOAD_PERMISSIONS, null);
    }
    //
    if(!account || !eos_account)
    {
      console.log(' roles-view: cant show component. account:', account, '-------- eos_account:', eos_account)
      return (null);
    }
    // console.log(' roles-view: YES show component.')
    const {account_type}  = account;
    const my_permisssions = globalCfg.bank.getPermsForAccountType(account_type);
    
    const renderPermContent = () => {
      
      console.log(' roles--view is_admin? ', is_admin)
      let perm = eos_account.permissions.filter( perm => perm.perm_name==authority )
      let list = (perm&&perm.length>0)?perm[0].required_auth.accounts:[];
      if(!is_admin && perm && perm.length>0)
        list = list.filter(acc => acc.permission.actor.trim()!=eos_account.account_name.trim());
      if(!is_admin && perm && perm.length>0)
        list = list.filter(acc => acc.permission.actor.trim()!=globalCfg.bank.issuer);

      return (
            
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[<a  key={"delete-"+item.permission.actor+item.permission.permission} 
                                onClick={() => onDeletePermission(authority, item.permission.actor, item.permission.permission )}
                              disabled={item.permission.actor==globalCfg.bank.issuer}>{delete_text}</a>]}
                >
                  <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                      avatar={
                        <span className="ant-avatar"><Icon style={{fontSize:16, color: 'rgba(0, 0, 0, 0.65)' }} type="key" /> </span>
                      }
                      title={<a href="#">{item.permission.actor}</a>}
                      description={'@'+item.permission.permission}
                    />
                    <div></div>
                  </Skeleton>
                </List.Item>
              )}
            />
      
      );
    }

    return(

            
              <Card 
                key={'card_master'}
                style = { { marginBottom: 24 } } 
                extra = {[<Button key="_new_perm" size="small" icon="plus" onClick={() => onNewPermission()}> {new_text}</Button>,
                          <Button key="_reload_perm" size="small" icon="reload" onClick={() => onReloadPermission()} style={{marginLeft:8}}> {reload_text}</Button>]}
                tabList={my_permisssions.map(perm=>{
                  return {key: perm
                          , tab: (
                            <span><InjectMessage id={`components.Views.roles.${perm}`} /></span>
                          )}
          
                })}
                activeTabKey={authority}
                onTabChange={(tab_key) => { tabChange(tab_key)} }
          
                >
                <div style={{ margin: '0 auto', width:'100%', padding: 24, background: '#fff'}}>
                  {renderPermContent()}        
                </div>
              </Card>  
      
    );

}
//
export default connect(
    (state)=> ({
      isAdmin:           loginRedux.isAdmin(state),
    })
)(injectIntl(AccountRolesView))

