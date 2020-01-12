import React from 'react'
import loadable from '@loadable/component'
import { BrowserRouter as Router, Route, Redirect, withRouter } from "react-router-dom";

import { connect } from 'react-redux';

import { Spin } from 'antd'

import { BlankContainer } from '@app/containers/blank.container';
import DashboardContainer from '@app/containers/dashboard.container';

import Login from '@app/pages/general/login'
import MenuByRole from './menu';

import history from '@app/history.js'

import * as loginRedux from '@app/redux/models/login'

// LOGIN, ROLES and REDIRECT TO REFERRER -- > https://reacttraining.com/react-router/web/example/auth-workflow

const _checkRole = ({role, actualRole, children, history, location}) => {
    
    // console.log( ' ************ ', ' ROUTER -> role:', role, '=== actualRole:', actualRole );

    if (role==='*' || role=== actualRole) {

        return (<>{children}</>);
    }
    // 
    else {
        if(actualRole) 
        {
          if(actualRole=='bankadmin') 
          {
            // history.push(`/${actualRole}/dashboard`);
            // history.push(`/common/salaries`);
            // history.push(`/common/crew`);
            // history.push(`/${actualRole}/configuration`);
            // history.push(`/${actualRole}/iugu`);
            // history.push(`/${actualRole}/profiles`);
            // history.push(`/${actualRole}/operations`);
            // history.push(`/${actualRole}/provider-profile`);
            // history.push(`/${actualRole}/providers`);
            // history.push(`/${actualRole}/external-transfers`);
            // history.push(`/${actualRole}/pda`);
            // history.push(`/${actualRole}/accounts`);
            history.push(`/${actualRole}/create-account`);
            // history.push({
            //   pathname: `/${actualRole}/external-transfers-process-request`
            //   , state: { request: request }
            // })
          } 
          
          if(actualRole=='business') 
          { 
            history.push(`/common/extrato`);
            // history.push(`/common/deposit`);
            // history.push(`/common/providers`);
            // history.push(`/common/request-money`);
            // history.push(`/common/salaries`);
            // history.push(`/common/send`);
            // history.push(`/${actualRole}/providers-payments`);
            // history.push(`/${actualRole}/providers-payments-request`);
            // history.push(`/${actualRole}/provider-payment-request-details`);
            // history.push(`/common/deposit`);
            // history.push(`/common/withdraw`);
            // history.push(`/${actualRole}/pdv`);
            // history.push(`/common/contracted-services`);
            // history.push(`/common/services`);
            // history.push(`/common/crew`);   
            // history.push(`/common/configuration`);
            // history.push(`/common/create-provider`);
          }  
          
          if(actualRole=='personal') {
              history.push(`/common/extrato`);
              // history.push(`/common/contracted-services`);
              // history.push(`/common/send`);
              // history.push(`/common/deposit`);
              // history.push(`/common/withdraw`);
              // history.push(`/${actualRole}/exchange`);
              //history.push(`/${actualRole}/account-settings`);
              //history.push(`/${actualRole}/dashboard`);
          }
          if(actualRole=='foundation') {
              history.push(`/common/extrato`);
              // history.push(`/common/send`);
              // history.push(`/common/deposit`);
              // history.push(`/common/withdraw`);
              // history.push(`/${actualRole}/exchange`);
              //history.push(`/${actualRole}/account-settings`);
              //history.push(`/${actualRole}/dashboard`);
          }
          
        }
        else {
            history.push(`/login`);
        }
        return false;
    }
}

const CheckRole = connect((state)=>({
    actualRole:       loginRedux.actualRole(state),
}),()=>({}))(withRouter(_checkRole))

const CheckLogin = () => <CheckRole role={undefined}><Login/></CheckRole>
//

const loadableComponent = (area, fileName, container, role, itemPath)=> {
    // console.log(' **** loadableComponent:', role, '@', area, '/', fileName)
    const ayncComponent = loadable(() => import(`../pages/${area}/${fileName}`), {
        fallback: <Spin style={{marginTop: '100px'}}/>,
    })
    let Container;
    if(container === 'dashboard') {
        // console.log('ABOUT TO RENDER SIDE MENU')
        Container = ()=> <DashboardContainer footerText=""  TopMenu="" Children={ayncComponent} Menu={MenuByRole} area={area} fileName={fileName} itemPath={itemPath} />
        
    } else {
        Container = ()=> <BlankContainer Children={ayncComponent} />
    }

    if (role) {
        return ()=>(<CheckRole role={role}><Container/></CheckRole>)
    }
    return ()=><Container />
}

export const DashboardRouter = ({routes}) => {    
  return (
    <Router history={history}>
        <Route path="/login" component={CheckLogin} />
        {routes.map(item => <Route key={'/'+item.area+'/'+item.path} path={'/'+item.area+'/'+item.path} component={loadableComponent(item.area, item.fileName, item.container, item.role, item.path)} /> )}
        <Route path={'/'} component={()=><Redirect to={'/login'} />} />
    </Router>
  );
}

