import React from 'react'
import { notification } from 'antd';

export const openNotificationWithIcon = (type, title, message, onClose) => {
  
  notification[type]({
    key:         `key_${Math.random()}`,
    message:     title,
    description: message,
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

export const exceptionNotification = (title, ex, onClose) => {
  const message = (ex && Object.keys(ex).length>0)?JSON.stringify(ex):'Please check internet connection and service availability!';
  openNotificationWithIcon('error', title, message, onClose)
}

