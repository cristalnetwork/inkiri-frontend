import React, { Component } from 'react';
import { Tag, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { injectIntl } from "react-intl";

import groupBy from 'lodash/groupBy';
import moment from 'moment';

import * as messagingRedux from '@app/redux/models/messaging'
import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

// import * as NoticeIcon from '@app/components/NoticeIcon';
import NoticeIcon from './NoticeIcon';
import styles from './index.less';

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
    // const { id } = clickedItem;
    // const { dispatch } = this.props;
    // if (dispatch) {
    //   dispatch({
    //     type: 'global/changeNoticeReadState',
    //     payload: id,
    //   });
    // }
  };

  handleNoticeClear = (title, key) => {
    // const { dispatch } = this.props;
    message.success(`${this.props.intl.formatMessage({ id: 'component.noticeIcon.cleared' })} ${title}`);

    // if (dispatch) {
    //   dispatch({
    //     type: 'global/clearNotices',
    //     payload: key,
    //   });
    // }
  };

  getNoticeData = () => {
    
    // 
    
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.created_at) {
        newNotice.created_at = moment.unix(notice.created_at).fromNow();
      }
      if (newNotice._id) {
        newNotice.key = newNotice._id;
      }
      if (newNotice.message && newNotice.state) {
        // const color = {
        //   todo: '',
        //   processing: 'blue',
        //   urgent: 'red',
        //   doing: 'gold',
        // }[newNotice.status];
        const color = globalCfg.api.stateToColor(newNotice.state)
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    // return groupBy(newNotices, '__typename');
    return {'notification':newNotices};
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
    const unreadMsgCount  = Object.keys(unreadMsg).map(key=>unreadMsg[key].length).reduce((acc, obj) => { acc = acc+obj; return acc; } , 0);
    const {formatMessage} = this.props.intl;

    return (
      <NoticeIcon
        className={styles.action}
        count={unreadMsgCount}
        onItemClick={item => {
          this.changeReadState(item);
        }}
        loading={fetchingNotices}
        clearText={formatMessage({ id: 'component.noticeIcon.clear' })}
        viewMoreText={formatMessage({ id: 'component.noticeIcon.view-more' })}
        onClear={this.handleNoticeClear}
        onPopupVisibleChange={onShownMessages}
        onViewMore={() => message.info('Click on view more')}
        clearClose
      >
        <NoticeIcon.Tab
          tabKey="notification"
          count={unreadMsg.notification}
          list={noticeData.notification}
          title={formatMessage({ id: 'component.globalHeader.notification' })}
          emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
          showViewMore
        />
        <NoticeIcon.Tab
          tabKey="message"
          count={unreadMsg.message}
          list={noticeData.message}
          title={formatMessage({ id: 'component.globalHeader.message' })}
          emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
          showViewMore
        />
        <NoticeIcon.Tab
          tabKey="event"
          title={formatMessage({ id: 'component.globalHeader.event' })}
          emptyText={formatMessage({ id: 'component.globalHeader.event.empty' })}
          count={unreadMsg.event}
          list={noticeData.event}
          showViewMore
        />
      </NoticeIcon>
    );
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
      onShownMessages:    bindActionCreators(messagingRedux.onShownMessages, dispatch),
      collapseMenu:       bindActionCreators(menuRedux.collapseMenu, dispatch),

    })
)( injectIntl(GlobalHeaderRight))
