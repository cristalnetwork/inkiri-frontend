// import { DropDownProps } from 'antd/es/dropdown';
import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

// declare type OverlayFunc = () => React.ReactNode;

// export interface HeaderDropdownProps extends DropDownProps {
//   overlayClassName?: string;
//   overlay: React.ReactNode | OverlayFunc;
//   placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
// }

const HeaderDropdown = ({ overlayClassName, ...restProps }) => (
  <Dropdown overlayClassName={classNames(styles.container, overlayClassName)} {...restProps} />
);

export default HeaderDropdown;
