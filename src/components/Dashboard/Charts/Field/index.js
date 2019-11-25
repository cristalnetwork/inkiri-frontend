import React from 'react';
import styles from './index.less';

// export interface FieldProps {
//   label: React.ReactNode;
//   value: React.ReactNode;
//   style?: React.CSSProperties;
// }

const Field = ({ label, value, ...rest }) => (
  <div className={'field'} {...rest}>
    <span className={'label'}>{label}</span>
    <span className={'number'}>{value}</span>
  </div>
);

export default Field;
