import React, { Component } from 'react';
import { Tag, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { injectIntl } from "react-intl";

import groupBy from 'lodash/groupBy';
import moment from 'moment';

import * as request_helper from '@app/components/TransactionCard/helper';

import * as messagingRedux from '@app/redux/models/messaging'
import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

// import * as NoticeIcon from '@app/components/NoticeIcon';
import NoticeIcon, {Tab as NoticeIconTab} from './NoticeIcon';
import './index.less';


class GlobalHeaderRight extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    // const { dispatch } = this.props;
    // if (dispatch) {
    //   dispatch({
    //     type: 'global/fetchNotices',
    //   });
    // }

  }

  changeReadState = (clickedItem) => {
    message.success(`${this.props.intl.formatMessage({ id: 'component.noticeIcon.read' })}`);
    // console.log('****changeReadState(clickedItem)', clickedItem._id , clickedItem.message && clickedItem.message._id );
    const { _id } = clickedItem.message;
    this.props.onReadMessage(_id);
    // const { dispatch } = this.props;
    // if (dispatch) {
    //   dispatch({
    //     type: 'global/changeNoticeReadState',
    //     payload: id,
    //   });
    // }
  };

  // handleNoticeClear = (title, key) => {
  //   // const { dispatch } = this.props;
  //   message.success(`${this.props.intl.formatMessage({ id: 'component.noticeIcon.cleared' })} ${title}`);
  // };

  handleNoticeClear = (_list) => {
    message.success(`${this.props.intl.formatMessage({ id: 'component.noticeIcon.cleared' })}`);
    this.props.clearMessages(_list.map(msg=>msg.message._id));
  };

  getNoticeData = () => {
    
    // 
    
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      let newNotice = { ...notice };
      console.log(newNotice)
      newNotice.type = 'notification'; //hack
      if (newNotice.message.created_at) {
        newNotice.created_at = moment.unix(newNotice.message.created_at/1000).fromNow();
      }
      if (newNotice.message._id) {
        newNotice.message.key = newNotice.message._id;
      }
      if (newNotice.message ) {
        newNotice.message.avatar = request_helper.smallCircleIcon(newNotice.message);
      }
      if (newNotice.message.message && newNotice.message.state) {
        const color = globalCfg.api.stateToColor(newNotice.message.state)
        // newNotice.extra = (
        //   <Tag color={color} style={{ marginRight: 0 }}>
        //     {newNotice.message.message}
        //   </Tag>
        // );
        newNotice.extra = request_helper.getSimpleStateTag(newNotice.message)
      }
      return newNotice;
    });
    //
    // return groupBy(newNotices, 'message.requested_type');
    return groupBy(newNotices, 'type');
    // return {'notification':newNotices};
  };
  //
  getUnreadData = (noticeData) => {
    const unreadMsg = {};
    Object.keys(noticeData).forEach(key => {
      const value = noticeData[key];
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };
  //
  render() {
    const { fetchingNotices, onShownMessages } = this.props;
    const noticeData      = this.getNoticeData();
    const unreadMsg       = this.getUnreadData(noticeData);
    
    console.log('**************** noticeData:', noticeData)
    console.log('**************** unreadMsg:', unreadMsg)
    
    const unreadMsgCount  = Object.keys(unreadMsg).reduce((acc, key) => { acc = acc+unreadMsg[key]; return acc; } , 0)||0;
    const {formatMessage} = this.props.intl;

    return (
      <NoticeIcon
        className={'action'}
        count={unreadMsgCount}
        onItemClick={item => {
          this.changeReadState(item);
        }}
        loading={fetchingNotices||false}
        clearText={formatMessage({ id: 'component.noticeIcon.clear' })}
        viewMoreText={formatMessage({ id: 'component.noticeIcon.view-more' })}
        onClear={()=>this.handleNoticeClear(noticeData.notification)}
        onPopupVisibleChange={onShownMessages}
        onViewMore={() => message.info('Click on view more')}
        clearClose
      >
        <NoticeIconTab
          tabKey="notification"
          count={unreadMsg.notification}
          list={noticeData.notification}
          title={formatMessage({ id: 'component.globalHeader.notification' })}
          emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
          showViewMore
        />
      </NoticeIcon>
    );

    // return (
    //   <NoticeIcon
    //     className={'action'}
    //     count={unreadMsgCount}
    //     onItemClick={item => {
    //       this.changeReadState(item);
    //     }}
    //     loading={fetchingNotices||false}
    //     clearText={formatMessage({ id: 'component.noticeIcon.clear' })}
    //     viewMoreText={formatMessage({ id: 'component.noticeIcon.view-more' })}
    //     onClear={this.handleNoticeClear}
    //     onPopupVisibleChange={onShownMessages}
    //     onViewMore={() => message.info('Click on view more')}
    //     clearClose
    //   >
    //     <NoticeIconTab
    //       tabKey="notification"
    //       count={unreadMsg.notification}
    //       list={noticeData.notification}
    //       title={formatMessage({ id: 'component.globalHeader.notification' })}
    //       emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
    //       showViewMore
    //     />
    //     <NoticeIconTab
    //       tabKey="message"
    //       count={unreadMsg.message}
    //       list={noticeData.message}
    //       title={formatMessage({ id: 'component.globalHeader.message' })}
    //       emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
    //       showViewMore
    //     />
    //     <NoticeIconTab
    //       tabKey="event"
    //       title={formatMessage({ id: 'component.globalHeader.event' })}
    //       emptyText={formatMessage({ id: 'component.globalHeader.event.empty' })}
    //       count={unreadMsg.event}
    //       list={noticeData.event}
    //       showViewMore
    //     />
    //   </NoticeIcon>
    // );
  }
}

//
export default connect(
    (state)=> ({
      actualAccountName : loginRedux.actualAccountName(state),
      menuIsCollapsed :   menuRedux.isCollapsed(state),
      notices:            messagingRedux.messages(state),
    }),
    (dispatch)=>({
      clearMessages:      bindActionCreators(messagingRedux.clearMessages, dispatch),
      onReadMessage:      bindActionCreators(messagingRedux.onReadMessage, dispatch),
      onShownMessages:    bindActionCreators(messagingRedux.onShownMessages, dispatch),
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch),

    })
)( injectIntl(GlobalHeaderRight))
