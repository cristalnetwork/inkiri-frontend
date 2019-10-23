import React from 'react';
import { Provider } from 'react-redux'
import { store } from './redux/configureStore';
import { DashboardRouter } from './providers/router'
import routes from '@app/configs/routes'
import './App.css';
import './App.less';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTruckMoving } from '@fortawesome/free-solid-svg-icons'


const App = () =>{
    

    library.add(faTruckMoving)

    return (
      <div className="App">
        <Provider store={store}>
            <DashboardRouter routes={routes} />
        </Provider>
      </div>
    );
}

export default App;