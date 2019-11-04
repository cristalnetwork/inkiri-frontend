import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Skeleton = ({content, icon}) => {
    
    return(

      <div className="cards" style={{maxWidth:'700px'}}>
        <section className="my-data my-data-firts info-account " style={{backgroundColor:'#fcfcfc'}}>
          <div className="info-personal">
            <div className="my-data-info add-picture">
              <div className="add-picture-content" style={{width: 125, height: 125, position: 'relative'}}>
                <div id="pickfiles" className="add-picture-badge-img" style={{width: 125, height: 125, zIndex: 10, position: 'relative'}}>
                  <span id="pickfileDefault" className="add-picture-badge" style={{border: '1px solid rgb(153, 153, 153)', backgroundColor: 'white', display:'flex', justifyContent:'center', alignItems:'center'}}
                    >
                    <FontAwesomeIcon icon={icon||'user'} size="5x" color="gray"/>
                  </span>
                  
                </div>
              </div>
            </div>

            {content}

          </div>
        </section>
      </div>      
    )

    
}
//
export default (Skeleton)

