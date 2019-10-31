import React from 'react';
import { Provider } from 'react-redux'
import { store } from './redux/configureStore';
import { DashboardRouter } from './providers/router'
import routes from '@app/configs/routes'
import './App.css';
import './App.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faFlagCheckered, faUserClock, faCloud, faFilePdf, faTruckMoving, faFileInvoice, faFileInvoiceDollar, faReceipt, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons';


const App = () =>{
    

    library.add(fab, faFlagCheckered, faUserClock, faCloud, faTruckMoving, faFileInvoiceDollar, faFileInvoice, faReceipt, faFilePdf, faChevronRight)

    return (
      <div className="App">
        <Provider store={store}>
            <DashboardRouter routes={routes} />
        </Provider>
      </div>
    );
}

export default App;