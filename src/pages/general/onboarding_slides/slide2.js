import React from 'react';
import InjectMessage from "@app/components/intl-messages";

const Slide2 = (props) => {
  //values={{br: (str) => <br/>}}
  return (
    <div className="banner">
      <div className="banner_text">
        <h3><InjectMessage id={'global.onboarding.title2'} values={{x:'', bold: (str) => <br/>}} /> </h3> 
        <p><InjectMessage id={'global.onboarding.subtitle2'} /></p> 
      </div>
      <div className="banner_image">
        <img src="/images/onboarding/EzhXjBHtavGDkTbewrvp.png" height="250" width="auto" />
      </div>
    </div>
    );
}
export default Slide2;

