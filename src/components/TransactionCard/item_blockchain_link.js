import React from 'react';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ItemBlockchainLink = ({tx_id, title, size}) => {
    
    if(!tx_id)
      return (null);
      
    const href = request_helper.getBlockchainUrl(tx_id);
    
    //ui-info-row--background-gray
    //chevron-right
    // return (<li className="ui-row ui-info-row ui-info-row--medium">
    //             <div className="ui-row__col ui-row__col--heading">
    //                 <div className="ui-avatar ">
    //                     <div className="ui-avatar__content ui-avatar__content--icon">
    //                       <FontAwesomeIcon icon="cloud" size="2x" className="icon_color_green"/>
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="ui-row__col ui-row__col--content">
    //               <div className="ui-info-row__content">
    //                     {link}
    //               </div>
    //             </div>
    //             <div className="ui-row__col ui-row__col--actions">
    //                 <FontAwesomeIcon icon="external-link-alt"  color="gray"/>
    //             </div>
    //         </li>);

    return (<div className="ui-list shorter">
              <a className="ui-row ui-info-row ui-info-row--medium" href={href} target="_blank">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar ">
                        <div className="ui-avatar__content ui-avatar__content--icon">
                          <FontAwesomeIcon icon="cloud" className="icon_color_green"/>
                        </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                  <div className="ui-info-row__content">
                        {title}
                  </div>
                </div>
                <div className="ui-row__col ui-row__col--actions">
                    <FontAwesomeIcon icon="external-link-alt"  color="gray"/>
                </div>
            </a>
          </div>);
}
//
export default (ItemBlockchainLink)