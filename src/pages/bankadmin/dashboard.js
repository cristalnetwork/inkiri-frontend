import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import * as utils from '@app/utils/utils';

import moment from 'moment';

class Operations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             false,
      
      
    };

    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
  }
  
  componentDidMount(){
    // this.loadAllTransactions(true);  
  } 

  
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  
  render() {
    const content               = (null)
    
    const {routes, active_tab}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Dashboard"

        >
        </PageHeader>
        
        <div className="styles standardList" style={{ marginTop: 24 }}>
            
            {content}

        </div>
      </>
    );
  }
}


export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        balance:              balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Operations)));