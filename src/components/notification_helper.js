import React from 'react'
import { notification } from 'antd';

export const openNotificationWithIcon = (type, title, message) => {
  notification[type]({
    message: title,
    description:message,
  });
}

export const errorNotification = (title, message) => {
  openNotificationWithIcon('error', title, message)
}

export const successNotification = (title, message) => {
  openNotificationWithIcon('success', title, message)
}

export const infoNotification = (title, message) => {
  openNotificationWithIcon('info', title, message)
}

export const warningNotification = (title, message) => {
  openNotificationWithIcon('warning', title, message)
}

export const exceptionNotification = (title, ex) => {
  const message = (ex && Object.keys(ex).length>0)?JSON.stringify(ex):'Please check internet connection and/or service availability!';
  openNotificationWithIcon('error', title, message)
}
