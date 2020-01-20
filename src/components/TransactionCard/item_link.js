import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ItemLink = ({link, icon, icon_size, is_external, text, href}) => {
    
    if(!link && !text && !href)
      return (null);
      
    // const link = (<Button type="link" href={href} size={icon_size||'default'} icon={icon||null} title={title}>{title}</Button>)
    
    //
    const external_icon = is_external?'external-link-alt':'chevron-right';
    
    if (link)
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
    //

    return (<div className="ui-list shorter">
              <a className="ui-row ui-info-row ui-info-row--medium" href={href} target="_blank">
                <div className="ui-row__col ui-row__col--heading">
                    <div className="ui-avatar ">
                        <div className="ui-avatar__content ui-avatar__content--icon">
                          <FontAwesomeIcon icon={icon} size={icon_size||'2x'} className="icon_color_green"/>
                        </div>
                    </div>
                </div>
                <div className="ui-row__col ui-row__col--content">
                  <div className="ui-info-row__content">
                        {text}
                  </div>
                </div>
                <div className="ui-row__col ui-row__col--actions">
                    <FontAwesomeIcon icon={external_icon}  color="gray"/>
                </div>
            </a>
          </div>);
}
//
export default (ItemLink)