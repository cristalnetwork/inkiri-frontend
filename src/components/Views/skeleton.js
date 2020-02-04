import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Skeleton = ({content, icon, title=''}) => {
    
    return(

      <div className="cards">
        <section className="my-data my-data-firts info-account " style={{backgroundColor:'#fcfcfc'}}>
          <div className="info-personal">
            <div className="my-data-info add-picture">
              <div className="add-picture-content" style={{width: 125, height: 125, position: 'relative'}}>
                <div id="pickfiles" className="add-picture-badge-img" style={{width: 125, height: 125, zIndex: 10, position: 'relative'}}>
                  <span id="pickfileDefault" className="add-picture-badge" style={{border: '1px solid rgb(153, 153, 153)', backgroundColor: 'white', display:'flex', justifyContent:'center', alignItems:'center'}}
                    >
                    <FontAwesomeIcon icon={icon||'user'} size="4x" color="black"/>
                  </span>
                  {title!=''
                    ?(<h3>{title}</h3>)
                    :(null)}
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

