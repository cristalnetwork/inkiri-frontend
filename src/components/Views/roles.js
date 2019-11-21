import React, { useState, useEffect } from 'react';
import { Modal, Skeleton, List, Card, Empty, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// import Skeleton from '@app/components/Views/skeleton';
export const ENUM_EVENT_NEW_PERMISSION    = 'event_new_permission';
export const ENUM_EVENT_DELETE_PERMISSION = 'event_delete_permission';
export const ENUM_AUTHORITY_CHANGE        = 'event_authority_change';

const AccountRolesView = (props) => {
    
    const [loading, setLoading]        = useState(false);
    const [account, setAccount]        = useState(null);
    const [eos_account, setEosAccount] = useState(null);
    const [onEvent, setOnEvent]        = useState(null);
    const [authority, setAuthority]    = useState();
    const [is_admin, setIsAdmin]       = useState(props.isAdmin);
    

    useEffect(() => {
        setAccount(props.account);
        setEosAccount(props.eos_account);
        setOnEvent(props.onEvent||null);
        setLoading(props.loading||false);
        setAuthority(props.authority||'owner');
        setIsAdmin(props.isAdmin);
    });

    const fireEvent = (eventType, object) => {
      if(typeof onEvent === 'function') {
          onEvent(eventType, object)
      }
    }
    const tabChange = (authority) => {
      // console.log(tab_key);
      // setAuthority(tab_key);
      fireEvent(ENUM_AUTHORITY_CHANGE, authority); 
    }

    const onDeletePermission = (permission_name, permission_actor, permission_permission ) => {
      Modal.confirm({
        title: 'Confirm account role deletion',
        content: (<p>You are about to remove <b>{permission_actor}@{permission_permission}</b> from <b>{account.key}</b> <i>{permission_name}</i> authority's list. Continue or cancel.</p>),
        onOk() {
          fireEvent(ENUM_EVENT_DELETE_PERMISSION, 
          {
            permission: {
              name: permission_name, 
              actor: permission_actor, 
              permission : permission_permission
            }
          });          
        },
        onCancel() {
          
        },
      });

    }

    const onNewPermission = () => {
      fireEvent(ENUM_EVENT_NEW_PERMISSION, authority);
    }
    //
    if(!account || !eos_account)
    {
      console.log(' roles-view: cant show component. account:', account, '-------- eos_account:', eos_account)
      return (null);
    }
    console.log(' roles-view: YES show component.')
    const {account_type}  = account;
    const my_permisssions = globalCfg.bank.getPermsForAccountType(account_type);
    
    const renderPermContent = () => {
      
      let perm = eos_account.permissions.filter( perm => perm.perm_name==authority )
      let list = [];
      if(perm && perm.length>0)
        list = perm[0].required_auth.accounts.filter(acc => acc.permission.actor.trim()!=eos_account.account_name.trim());
      if(is_admin && perm && perm.length>0)
        list = perm[0].required_auth.accounts.filter(acc => acc.permission.actor.trim()!=globalCfg.bank.issuer);

      return (
            
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[<a  key={"delete-"+item.permission.actor+item.permission.permission} 
                                onClick={() => onDeletePermission(authority, item.permission.actor, item.permission.permission )}
                              disabled={item.permission.actor==globalCfg.bank.issuer}>DELETE</a>]}
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
                extra = {<Button key="_new_perm" size="small" icon="plus" onClick={() => onNewPermission()}> New</Button>}
                tabList={my_permisssions.map(perm=>{
                  return {key: perm
                          , tab: (
                            <span>{utils.capitalize(perm)}</span>
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
      isAdmin:           loginRedux.actualRole(state),
    })
)(AccountRolesView)

