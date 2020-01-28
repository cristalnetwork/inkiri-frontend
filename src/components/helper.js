import React from 'react'
import { Icon } from 'antd';
import { Link } from 'react-router-dom';
import * as notification from './notification_helper';
import InjectMessage from "@app/components/intl-messages";

export {notification as notif};

export const itemRender = (route, params, routes, paths) => {
  const last = routes.indexOf(route) === routes.length - 1;
  const first = routes.indexOf(route) === 0;
  if(last)
    return <span><InjectMessage id={`breadcrumb.path.${route.original_path}`} /></span>;
  return first ? (
    <Link to="/"><Icon type="home" /></Link>
  ) : (
    <Link to={route.path}><InjectMessage id={`breadcrumb.path.${route.original_path}`} /></Link>
  );
}

//route.breadcrumbName
