import { Badge, Icon, Spin, Tabs } from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import NoticeList, { NoticeIconTabProps } from './NoticeList';

import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import './header.css';

const { TabPane } = Tabs;

export {NoticeList as Tab};

export default class NoticeIcon extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  onItemClick = (item, tabProps) => {
    const { onItemClick } = this.props;
    if (onItemClick) {
      onItemClick(item, tabProps);
    }
  };

  onClear = (name, key) => {
    const { onClear } = this.props;
    if (onClear) {
      onClear(name, key);
    }
  };

  onTabChange = (tabType) => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      onTabChange(tabType);
    }
  };

  onViewMore = (tabProps, event) => {
    const { onViewMore } = this.props;
    if (onViewMore) {
      onViewMore(tabProps, event);
    }
  };

  getPane = (child, is_tab) => {
    const { clearText, viewMoreText } = this.props;
    const { list, title, count, tabKey, showClear, showViewMore } = child.props;
    const len = list && list.length ? list.length : 0;
    const msgCount = count || count === 0 ? count : len;
    const tabTitle = msgCount > 0 ? `${title} (${msgCount})` : title;
    console.log('TABPANE:::', tabKey, title)
    const notif_list = (<NoticeList
          key={tabKey+'xxx'}
          clearText={clearText}
          viewMoreText={viewMoreText}
          data={list}
          onClear={() => this.onClear(title, tabKey)}
          onClick={(item) => this.onItemClick(item, child.props)}
          onViewMore={(event) => this.onViewMore(child.props, event)}
          showClear={showClear}
          showViewMore={showViewMore}
          title={title}
          {...child.props}
        />);

    if(is_tab==true)
      return (
        <TabPane tab={tabTitle} key={tabKey}>
          {notif_list}
        </TabPane>
      );
    //
    return notif_list;
  }
  //
  getNotificationBox() {
    const { children, loading } = this.props;

    if (!children) {
      return null;
    }
    
    const children_map = React.Children.map(children, (child)=>child);

    if (children_map.length==1) {
      console.log('************solo 1')
      return this.getPane(children_map[0])
    }
    
    const panes = React.Children.map(
      children,
      (child) => {
        if (!child) {
          return null;
        }
        return this.getPane(child, true);
      }
    );
    //
    // return (
    //   <>
    //     <Spin spinning={loading} delay={300}>
    //       <Tabs className="tabs antd-pro-components-notice-icon-index-tabs" onChange={this.onTabChange}>
    //         {panes}
    //       </Tabs>
    //     </Spin>
    //   </>
    // );
    //defaultActiveKey="notification"
    return (
      <Spin spinning={loading} delay={300}>
          <Tabs className="tabs antd-pro-components-notice-icon-index-tabs" key="tabs" onChange={this.onTabChange}>
            {panes}
          </Tabs>
      </Spin>
    );
  }
  //
  handleVisibleChange = (visible) => {
    const { onPopupVisibleChange } = this.props;
    this.setState({ visible });
    if (onPopupVisibleChange) {
      onPopupVisibleChange(visible);
    }
  };
  //
  render() {
    const { className, count, popupVisible, bell } = this.props;
    const { visible } = this.state;
    // const noticeButtonClass = classNames(className, 'noticeButton', 'action');
    const noticeButtonClass = classNames(className, 'noticeButton');
    const notificationBox = this.getNotificationBox();
    const NoticeBellIcon = bell || <Icon type="bell" />;
    const trigger = (
      <span className={classNames(noticeButtonClass, { opened: visible })}>
        <Badge count={count} style={{ boxShadow: 'none' }} className={'badge'}>
          {NoticeBellIcon}
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }

    // 
    return (
      <HeaderDropdown
        className="notification_action"
        placement="bottomRight"
        overlay={<div className="ant-dropdown-menu-container">{notificationBox}</div>}
        overlayClassName={'popoverNONO antd-pro-components-header-dropdown-index-container antd-pro-components-notice-icon-index-popover ant-dropdown-placement-bottomRight '}
        trigger={['click']}
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
        {...popoverProps}
      >
        {trigger}
      </HeaderDropdown>
    );
  }
}
