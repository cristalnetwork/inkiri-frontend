import React from 'react';
import { Icon, Menu } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as menuRedux from '@app/redux/models/menu'

import classNames from 'classnames';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

import { injectIntl } from "react-intl";

import AppLocale from "@app/lang";

const SelectLanguage = props => {
  const { className } = props;
  const changeLang = ({ key }) => props.setLanguage(key);
  const locales = Object.keys(AppLocale).map(key => {return{locale:AppLocale[key].locale, title:AppLocale[key].title}} );
  const langMenu = (
    <Menu className={styles.menu} selectedKeys={[props.language]} onClick={changeLang}>
      {locales.map(locale => (
        <Menu.Item key={locale.locale}>
          {locale.title}
        </Menu.Item>
      ))}
    </Menu>
  );
  // const fontSize = props.size=='big'?16:12;
  const fontSize = 16;
  return (
    <HeaderDropdown overlay={langMenu} placement="bottomRight"  >
      <span className={classNames(styles.dropDown, className, 'language_selector')} style={{ marginLeft:8}}>
        <Icon style={{fontSize:fontSize}} type="global" title={props.intl.formatMessage({ id: 'global.navbar.lang_selector' })} />
      </span>
    </HeaderDropdown>
  );
};

export default (connect(
    (state)=> ({
      language :          menuRedux.language(state),
    }),
    (dispatch)=>({
      setLanguage:        bindActionCreators(menuRedux.setLanguage, dispatch),
    
    })
)( injectIntl(SelectLanguage) ) );
