import { Avatar, List } from 'antd';

import React from 'react';
import classNames from 'classnames';
import './NoticeList.less';


const NoticeList = ({
  data = [],
  onClick,
  onClear,
  title,
  onViewMore,
  emptyText,
  showClear = true,
  clearText,
  viewMoreText,
  showViewMore = false,
}) => {

  if (data.length === 0) {
    return (
      <div className="notFound">
        <img
          src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
          alt="not found"
        />
        <div>{emptyText||'N/A'}</div>
      </div>
    );
  }
  return (
      [   <div key={title+'zzz'} className={'bottomBar bottom_bordered'}>
            {title}
          </div>, 
          <List
            key={title+'yyy'}
            className="list ant-list antd-pro-components-notice-icon-notice-list-list ant-list-split"
            dataSource={data}
            renderItem={(item, i) => {
              const itemCls = classNames('item ant-list-item antd-pro-components-notice-icon-notice-list-item', {
                ['read']: item.read,
              });
              // eslint-disable-next-line no-nested-ternary
              const leftIcon = item.message.avatar ? (
                typeof item.message.avatar === 'string' ? (
                  <Avatar className={'avatar'} src={item.message.avatar} />
                ) : (
                  <span className={'iconElement'}>{item.message.avatar}</span>
                )
              ) : null;
    
              return (
                <List.Item
                  className={itemCls}
                  key={'key_'+i}
                  onClick={() => onClick && onClick(item)}
                >
                  <List.Item.Meta
                    className={'meta ant-list-item-meta antd-pro-components-notice-icon-notice-list-meta'}
                    avatar={leftIcon}
                    title={
                      <div className={'title ant-list-item-meta-title antd-pro-components-notice-icon-notice-list-title'}>
                        {item.message.title}
                        <div className={'extra'}>{item.extra}</div>
                      </div>
                    }
                    description={
                      <div>
                        <div className={'ant-list-item-meta-title description'}>{item.message.message}</div>
                        <div className={'datetime'}>{item.created_at}</div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />,
          <div key={title+'xxx'} className={'bottomBar antd-pro-components-notice-icon-notice-list-bottomBar'}>
            {showClear ? (
              <div onClick={onClear}>
                {clearText} {title}
              </div>
            ) : null}
            {showViewMore ? (
              <div
                onClick={e => {
                  if (onViewMore) {
                    onViewMore(e);
                  }
                }}
              >
                {viewMoreText}
              </div>
            ) : null}
          </div>
        ]
  );
};

export default NoticeList;
