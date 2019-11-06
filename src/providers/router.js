import React from 'react'
import loadable from '@loadable/component'
import { BrowserRouter as Router, Route, Redirect, withRouter } from "react-router-dom";

import { connect } from 'react-redux';

import { Spin } from 'antd'

import { BlankContainer } from '@app/containers/blank.container';
import { DashboardContainer } from '@app/containers/dashboard.container';

import Login from '@app/pages/general/login'
import MenuByRole from './menu';

import history from '@app/history.js'

import * as loginRedux from '@app/redux/models/login'

// LOGIN, ROLES and REDIRECT TO REFERRER -- > https://reacttraining.com/react-router/web/example/auth-workflow

const _checkRole = ({role, actualRole, children, history, location}) => {
    
    console.log( ' ************ ', ' ROUTER -> role:', role, '=== actualRole:', actualRole );

    if (role === actualRole) {

        return (<>{children}</>);
    }
    // 
    else {
        if(actualRole) 
        {
          if(actualRole=='bankadmin') 
          {
              // history.push(`/${actualRole}/provider-profile`);
              // history.push(`/${actualRole}/providers`);
              // history.push(`/${actualRole}/external-transfers`);
              history.push(`/${actualRole}/pda`);
              // history.push(`/${actualRole}/accounts`);
              // history.push(`/${actualRole}/create-account`);
              
              // const request = {"nota_fiscal_url":"","boleto_pagamento":"","comprobante_url":"","from":"yogamatrix12","requested_type":"type_provider","amount":"63.00","provider":{"address":{"street":"Rua do Rey 1115","city":"Rio de Janeiro","state":"Rio de Janeiro","zip":"111222","country":"Brazil"},"name":"Proveedor #ONE","cnpj":"123456789","email":"proveedor1@gmail.com","phone":"+025369875","category":"Proveedor de conocimiento","products_services":"Conocimientos, ideas, y eso","bank_accounts":[{"_id":"5d913a731bd9280c7a319cc1","bank_name":"Banco do Brasil","agency":"1234","cc":"987654321"}],"created_by":"5d67d2c78ed5673269c0a54c","created_at":"2019-09-26T13:17:15.630Z","updatedAt":"2019-09-29T23:12:51.619Z","providerCounterId":1,"updated_by":"5d67d2c78ed5673269c0a54c","id":"5d8cba5b494b1a316b854d7c"},"created_by":{"address":{"street":"Calle 18 n3877","city":"La Plata","state":"Buenos Aires","zip":"1900","country":"Brazil"},"self_created":true,"_id":"5d6ff44690e04230ab3e1216","account_name":"pablotutino1","email":"Pablo","last_name":"Tutino","legal_id":"28470","phone":"+549113127245","created_at":"2019-09-04T17:28:38.504Z","updatedAt":"2019-10-05T11:50:04.457Z","userCounterId":11,"_type":"personal","account_type":"personal","id":"5d6ff44690e04230ab3e1216"},"requested_by":{"address":{"street":"","city":"","state":"","zip":"","country":""},"self_created":true,"_id":"5d8b3e64f27a072cde7f4d33","account_type":"business","account_name":"yogamatrix12","email":"yogamatrix12@inkiri.com","last_name":"","legal_id":"","phone":"","business_name":"yoga matrix","created_at":"2019-09-25T10:16:04.921Z","updatedAt":"2019-09-25T10:16:04.921Z","userCounterId":18,"id":"5d8b3e64f27a072cde7f4d33"},"state":"state_requested","created_at":"2019-09-30T20:11:52.585Z","updated_at":"2019-09-30T20:11:54.535Z","requestCounterId":21,"tx_id":"de2d4d307f5f7c3244c429181155e163c49ad54762b82cfdf8339e79b28c7f23","id":"5d926188b1651e30fd49eba1","sub_header":"You have requested a  PROVIDER PAYMENT","sub_header_admin":"yogamatrix12 has requested a  PROVIDER PAYMENT","key":"5d926188b1651e30fd49eba1","block_time":"2019-09-30T20:11:52","quantity":"63.00","quantity_txt":"63.00 undefined","tx_type":"type_provider","i_sent":true}
              // history.push({
              //   pathname: `/${actualRole}/external-transfers-process-request`
              //   , state: { request: request }
              // })
          } 
          else {
            if(actualRole=='business') 
            {    
              history.push(`/${actualRole}/extrato`);
              // const request = {"provider_extra":{"payment_vehicle":"payment_vehicle_inkiri","payment_category":"payment_category_alugel","payment_type":"payment_type_despesa","payment_mode":"payment_mode_transfer"},"attach_nota_fiscal_id":"1onf8GC-wHsgJfW3gjqFVp96CE_U7gdRu","attach_boleto_pagamento_id":"","attach_comprobante_id":"","from":"yogamatrix12","requested_type":"type_provider","created_by":{"address":{"street":"Calle 18 n3877","city":"La Plata","state":"Buenos Aires","zip":"1900","country":"Brazil"},"self_created":true,"_id":"5d6ff44690e04230ab3e1216","account_name":"pablotutino1","email":"Pablo","last_name":"Tutino","legal_id":"28470","phone":"+549113127245","created_at":"2019-09-04T17:28:38.504Z","updatedAt":"2019-10-27T00:19:29.219Z","userCounterId":11,"_type":"personal","account_type":"personal","id":"5d6ff44690e04230ab3e1216"},"requested_by":{"address":{"street":"","city":"","state":"","zip":"","country":""},"self_created":true,"_id":"5d8b3e64f27a072cde7f4d33","account_type":"business","account_name":"yogamatrix12","email":"yogamatrix12@inkiri.com","last_name":"","legal_id":"","phone":"","business_name":"yoga matrix","created_at":"2019-09-25T10:16:04.921Z","updatedAt":"2019-09-25T10:16:04.921Z","userCounterId":18,"id":"5d8b3e64f27a072cde7f4d33"},"state":"state_requested","description":"something","amount":"4.10","provider":{"address":{"street":"Rua do Rey 1115","city":"Rio de Janeiro","state":"Rio de Janeiro","zip":"111222","country":"Brazil"},"name":"Proveedor #2","cnpj":"123456789","email":"proveedor2@gmail.com","phone":"+025369875","bank_accounts":[{"_id":"5d9223111c7b35351407ba08","bank_name":"Banco do Macao","agency":"1234","cc":"987654321"}],"created_by":"5d67d2c78ed5673269c0a54c","created_at":"2019-09-30T15:45:21.513Z","updatedAt":"2019-09-30T15:45:21.513Z","providerCounterId":4,"id":"5d9223111c7b35351407ba07"},"created_at":"2019-10-28T21:49:49.988Z","updated_at":"2019-10-28T21:49:52.591Z","requestCounterId":29,"tx_id":"1356fdfea6e896511754071b36449e6b20264ac6c7362fd5d8b32ee3650b8743","id":"5db7627d780dab1a00f54d40","sub_header":"You have requested a  PROVIDER PAYMENT","sub_header_admin":"yogamatrix12 has requested a  PROVIDER PAYMENT","key":"5db7627d780dab1a00f54d40","block_time":"2019-10-28T21:49:49","quantity":"4.10","quantity_txt":"4.10 undefined","tx_type":"type_provider","i_sent":true};
              // history.push({
              //   pathname: `/${actualRole}/provider-payment-request-details`
              //   , state: { request: request }
              // })
              // history.push(`/${actualRole}/provider-payment-request-details`);
              // history.push(`/${actualRole}/providers-payments-request`);
              // history.push(`/${actualRole}/providers-payments`);
              // history.push(`/${actualRole}/external-transfers`);
            } else {
                // if(actualRole=='personal')
                // history.push(`/${actualRole}/exchange`);
                // history.push(`/${actualRole}/account-settings`);
                // history.push(`/${actualRole}/withdraw`);
                // history.push(`/${actualRole}/dashboard`);
                // history.push(`/${actualRole}/deposit`);
                history.push(`/${actualRole}/extrato`);
                // history.push(`/${actualRole}/send-money`);
            }
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


