import React from 'react';
import { Provider } from 'react-redux'
import { store } from '@app/redux/configureStore';
import { DashboardRouter } from '@app/providers/router'
import routes from '@app/configs/routes'

import './App.css';
import './App.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFileExcel, faBan, faExclamationTriangle ,faMinusCircle, faComment, faFileSignature, faUserMinus, faUserPlus, faCalendarAlt, faCalculator, faShapes, faMoneyCheckAlt, faTrafficLight, faPiggyBank, faKeyboard, faKey, faExclamationCircle, faShieldAlt, faUserShield, faExternalLinkAlt, faQuestionCircle, faMagic, faCreditCard, faPaperPlane, faShoppingBag, faStore, faExchangeAlt, faArrowUp, faArrowDown, faArrowAltCircleUp, faUniversity, faPhone, faMapMarkerAlt, faIdCard, faUser, faUserCircle, faDollarSign, faEnvelope, faFlagCheckered, faUserClock, faCloud, faFilePdf, faTruckMoving, faFileInvoice, faFileInvoiceDollar, faReceipt, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';

// import { ConfigProvider } from "antd";

import {getLocale} from '@app/lang/helper';
import { IntlProvider } from "react-intl";
const currentAppLocale = getLocale();

const App = () =>{
    library.add(fab, faFileExcel,faBan, faExclamationTriangle, faComment, faMinusCircle, faFileSignature,faUserMinus, faUserPlus, faCalculator, faCalendarAlt, faShapes, faTrafficLight, faMoneyCheckAlt, faPiggyBank, faKey, faKeyboard, faExclamationCircle, faShieldAlt, faUserShield, faExternalLinkAlt, faQuestionCircle, faMagic, faCreditCard, faPaperPlane, faShoppingBag, faStore, faExchangeAlt, faArrowUp, faArrowDown, faArrowAltCircleUp, faUniversity, faMapMarkerAlt, faPhone, faIdCard, faUser, faUserCircle, faDollarSign, faEnvelope, faFlagCheckered, faUserClock, faCloud, faTruckMoving, faFileInvoiceDollar, faFileInvoice, faReceipt, faFilePdf, faChevronRight)
    return (
      <div className="App">
          <Provider store={store}>
            <IntlProvider locale={currentAppLocale.locale} messages={currentAppLocale.messages}>
              <DashboardRouter routes={routes} />
            </IntlProvider>
          </Provider>
      </div>
    );
}

export default App;

/*
<ConfigProvider locale={currentAppLocale.antd}>
  <IntlProvider
    locale={currentAppLocale.locale}
    messages={currentAppLocale.messages}>
       <div className="App">
        <Provider store={store}>
            <DashboardRouter routes={routes} />
        </Provider>
      </div>
  </IntlProvider>
</ConfigProvider>
*/