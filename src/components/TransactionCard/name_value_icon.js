import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const NameValueIcon = ({name, value, icon, not_alone, is_alarm, className}) => {
    
    const color        = is_alarm==true?"#CC0000":"#1890ff";
    const bg_classname = is_alarm?' ui-info-row--background-gray ':'';
    const item = (<>
                  {icon && <div className="ui-row__col ui-row__col--heading">
                                        <div className="ui-avatar">
                                          <div className="badge-extra-small badge-circle addresse-avatar ui-avatar__content--initials">
                                            <span className="picture">
                                              <FontAwesomeIcon icon={icon} size="lg" color={color}/>
                                            </span>
                                          </div>
                                        </div>
                                    </div>}
                  <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">{name?(name+':'):'' }&nbsp;<b>{value}</b></div>
                      </div>
                  </div>
                </>);
    //
    if(not_alone===true)
      return (item);

    return(
        <div className={`ui-list ${className}`}>
          <ul className="ui-list__content">
            <li className={`ui-row ui-info-row ui-info-row--medium ui-info-row ${bg_classname}`}>
              {item}
            </li>
          </ul>
        </div>
      );
    //
    
}

export default connect(
    (state)=> ({
    })
)(NameValueIcon)