import React from 'react'
import { Icon, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

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
//
// export const buildBreadcrumb = (name_function_array) => {
//   return (<Breadcrumb>
//       <Breadcrumb.Item href="">
//         <Icon type="home" />
//       </Breadcrumb.Item>
//       {name_function_array.map(item => 
//       <Breadcrumb.Item href="">
//         <Icon type="user" />
//         <span>Application List</span>
//       </Breadcrumb.Item>
//       )}
//     </Breadcrumb>);
// }