import React from 'react';
import { notification, Button } from 'antd';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import * as globalCfg from '@app/configs/global';

const nullOrUndefined = (value) => typeof value==='undefined' || value==null;
export const openNotificationWithIcon = (type, title, message, onClose, duration) => {
  notification.destroy();
  notification[type]({
    key:         `key_${Math.random()}`,
    message:     title,
    description: message,
    duration:    nullOrUndefined(duration)?5:duration,
    onClose:      () => {
      if(typeof onClose === 'function')
        onClose();
    },
    style: {
      width: 600,
      marginLeft: 400 - 600
    },
  });
}

export const errorNotification = (title, message, onClose) => {
  openNotificationWithIcon('error', title, message, onClose)
}

export const successNotification = (title, message, onClose) => {
  openNotificationWithIcon('success', title, message, onClose)
}

export const infoNotification = (title, message, onClose) => {
  openNotificationWithIcon('info', title, message, onClose)
}

export const warningNotification = (title, message, onClose) => {
  openNotificationWithIcon('warning', title, message, onClose)
}

export const exceptionNotification = (title, ex, onClose, intl) => {
  
  // is EOS error?
  if(ex&&ex.json&&ex.json.error&&ex.json.error.what){
    
    const eos_error = ex.json.error;
    const err_title = intl
      ? intl.formatMessage({id:`eos.errors.${eos_error.name}.${eos_error.code}`})
      : eos_error.what
    const err_details = (eos_error.details && Array.isArray(eos_error.details)&&eos_error.details.length>0)
      ? eos_error.details[0].message
      : '';
    
    let _title   = err_title;
    let _message = err_details;
    
    const copy_btn = (<CopyToClipboard key="copy_error_btn" text={JSON.stringify(ex)}>
                           <Button type="link" icon="copy" title="Copy error!"/>
                        </CopyToClipboard>);
    //
    const is_blockgin_notif = globalCfg.eos.push.breakable_error_codes.includes(eos_error.code);
    if(is_blockgin_notif)
    {
      console.log(' >> YES!!!, ', eos_error.code, ' IS IN array <<<<<<<<<<<<<<<<<<<<<<<<<<')
      _title       = intl
        ? intl.formatMessage({id:`eos.errors.title.wait_for_response`})
        : 'IMPORTANT!!!!';
      _message     = intl
        ? intl.formatMessage({id:`eos.errors.title.wait_for_response_intro`})
        : 'Please read the message and then go to Operations List and wait for results refreshing page manually!';
      _message = [(<span key="notification_message">{_message}</span>), (<span key="notification_message2"><br/>{err_title}<br/></span>), (copy_btn)];
    } 
    //
    _message = [(<span key="notification_message">{_message}<br/></span>), (copy_btn)]; 
      //
    openNotificationWithIcon('error', _title, _message, onClose, 0)
    return;  
  }

  const message = (ex && Object.keys(ex).length>0)
    ? JSON.stringify(ex)
    : 'Please check internet connection and service availability!';
  openNotificationWithIcon('error', title, message, onClose)
}


/*
  EOS EXCEPTIONs
  SOURCE: https://github.com/EOSIO/eos/blob/e19afc8072219282a7c3fc20e47aa80cb70299e4/libraries/chain/include/eosio/chain/exceptions.hpp
  FORMAT:
  {
        "json":
        {
            "code": 500,
            "message": "Internal Service Error",
            "error":
            {
                "code": 3081001,
                "name": "leeway_deadline_exception",
                "what": "Transaction reached the deadline set due to leeway on account CPU limits",
                "details": [
                {
                    "message": "the transaction was unable to complete by deadline, but it is possible it could have succeeded if it were allowed to run to completion",
                    "file": "transaction_context.cpp",
                    "line_number": 494,
                    "method": "checktime"
                },
                {
                    "message": "pending console output: ",
                    "file": "apply_context.cpp",
                    "line_number": 113,
                    "method": "exec_one"
                }]
            }
        }
    }


  {
    "json":
    {
        "code": 500,
        "message": "Internal Service Error",
        "error":
        {
            "code": 3050003,
            "name": "eosio_assert_message_exception",
            "what": "eosio_assert_message assertion failure",
            "details": [
            {
                "message": "assertion failure with message: overdrawn balance",
                "file": "wasm_interface.cpp",
                "line_number": 964,
                "method": "eosio_assert"
            },
            {
                "message": "pending console output: ",
                "file": "apply_context.cpp",
                "line_number": 113,
                "method": "exec_one"
            }]
        }
    }
}

*/