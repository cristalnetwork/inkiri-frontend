import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ErrorItem = (props) => {
  return (
    
    <div className="ui-alert-message ui-alert-message--red">
      <div className=" HACK_ui-alert-message__heading_HACK ui-row__col ui-row__col--heading">
        <div className="ui-avatar ">
          <div className="ui-avatar__content ui-avatar__content--icon">

            <FontAwesomeIcon icon="exclamation-circle" size="2x" color="red" />        
          </div>
        </div>
      </div>
      <div className="ui-alert-message__content">
        <h4 className="ui-alert-message__title">{props.title}</h4>
        <div className="ui-alert-message__description">
          <div>
            <p>{props.message}</p>
          </div>
        </div>
      </div>
    </div>

    );
}
export default ErrorItem;

