import React from 'react';
import { Provider } from 'react-redux'
import { store } from './redux/configureStore';
import { DashboardRouter } from './providers/router'
import routes from '@app/configs/routes'

import './App.css';
import './App.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faMinusCircle, faComment, faFileSignature, faUserMinus, faUserPlus, faCalendarAlt, faCalculator, faShapes, faMoneyCheckAlt, faTrafficLight, faPiggyBank, faKeyboard, faKey, faExclamationCircle, faShieldAlt, faUserShield, faExternalLinkAlt, faQuestionCircle, faMagic, faCreditCard, faPaperPlane, faShoppingBag, faStore, faExchangeAlt, faArrowUp, faArrowDown, faArrowAltCircleUp, faUniversity, faPhone, faMapMarkerAlt, faIdCard, faUser, faUserCircle, faDollarSign, faEnvelope, faFlagCheckered, faUserClock, faCloud, faFilePdf, faTruckMoving, faFileInvoice, faFileInvoiceDollar, faReceipt, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';

// import { LocaleProvider } from "antd";
import { ConfigProvider } from "antd";
import { IntlProvider } from "react-intl";
import AppLocale from "./lang";
const currentAppLocale = AppLocale['en'];


const App = () =>{
    library.add(fab, faComment, faMinusCircle, faFileSignature,faUserMinus, faUserPlus, faCalculator, faCalendarAlt, faShapes, faTrafficLight, faMoneyCheckAlt, faPiggyBank, faKey, faKeyboard, faExclamationCircle, faShieldAlt, faUserShield, faExternalLinkAlt, faQuestionCircle, faMagic, faCreditCard, faPaperPlane, faShoppingBag, faStore, faExchangeAlt, faArrowUp, faArrowDown, faArrowAltCircleUp, faUniversity, faMapMarkerAlt, faPhone, faIdCard, faUser, faUserCircle, faDollarSign, faEnvelope, faFlagCheckered, faUserClock, faCloud, faTruckMoving, faFileInvoiceDollar, faFileInvoice, faReceipt, faFilePdf, faChevronRight)
   return (
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
    );
}



// import * as globalCfg from '@app/configs/global';
// // import { ApolloClient } from 'apollo-client';
// // import { InMemoryCache } from 'apollo-cache-inmemory';
// // import { HttpLink } from 'apollo-link-http';
// import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'
// import { ApolloProvider, useQuery } from '@apollo/react-hooks';
// // import gql from 'graphql-tag';
// // import { ApolloProvider } from 'react-apollo';

// const cache = new InMemoryCache();
// const client = new ApolloClient({
//   cache,
//   link: new HttpLink({
//     uri:  globalCfg.api.graphql_endpoint,
//     // headers: {
//     //   authorization: localStorage.getItem('token'),
//     //   'client-name': 'Space Explorer [web]',
//     //   'client-version': '1.0.0',
//     // },
//   }),
// });

// const App = () =>{
//     library.add(fab, faComment, faMinusCircle, faFileSignature,faUserMinus, faUserPlus, faCalculator, faCalendarAlt, faShapes, faTrafficLight, faMoneyCheckAlt, faPiggyBank, faKey, faKeyboard, faExclamationCircle, faShieldAlt, faUserShield, faExternalLinkAlt, faQuestionCircle, faMagic, faCreditCard, faPaperPlane, faShoppingBag, faStore, faExchangeAlt, faArrowUp, faArrowDown, faArrowAltCircleUp, faUniversity, faMapMarkerAlt, faPhone, faIdCard, faUser, faUserCircle, faDollarSign, faEnvelope, faFlagCheckered, faUserClock, faCloud, faTruckMoving, faFileInvoiceDollar, faFileInvoice, faReceipt, faFilePdf, faChevronRight)
//     return (
//       <div className="App">
//         <ApolloProvider client={client}>
//           <Provider store={store}>
//             <DashboardRouter routes={routes} />
//           </Provider>
//         </ApolloProvider>
//       </div>
//     );
// }

export default App;