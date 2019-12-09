import React from 'react'
import { Icon, Button} from 'antd';
import { Link } from 'react-router-dom';
import * as notification from './notification_helper';

export {notification as notif};

export const itemRender = (route, params, routes, paths) => {
  const last = routes.indexOf(route) === routes.length - 1;
  const first = routes.indexOf(route) === 0;
  if(last)
    return <span>{route.breadcrumbName}</span>;
  return first ? (
    <Link to="/"><Icon type="home" /></Link>
  ) : (
    <Link to={route.path}>{route.breadcrumbName}</Link>
  );
}
