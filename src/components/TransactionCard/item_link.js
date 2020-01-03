import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ItemLink = ({link, icon, icon_size, is_external}) => {
    
    if(!link)
      return (null);
  
    // const link = (<Button type="link" href={href} size={icon_size||'default'} icon={icon||null} title={title}>{title}</Button>)
    
    //
    const external_icon = is_external?'external-link-alt':'chevron-right';
    return (<li className="ui-row ui-info-row ui-info-row--medium">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar ">
                        <div className="ui-avatar__content ui-avatar__content--icon">
                          <FontAwesomeIcon icon={icon} size={icon_size||'2x'} className="icon_color_green"/>
                        </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                  <div className="ui-info-row__content">
                        {link}
                  </div>
                </div>
                <div className="ui-row__col ui-row__col--actions">
                    <FontAwesomeIcon icon={external_icon}  color="gray"/>
                </div>
            </li>);
}
//
export default (ItemLink)