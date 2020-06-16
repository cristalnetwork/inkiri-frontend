import React from 'react';
import InjectMessage from "@app/components/intl-messages";

const Slide1 = (props) => {
  //values={{br: (str) => <br/>}}
  return (
    <div className="banner">
      <div className="banner_text">
        <h3><InjectMessage id={'global.onboarding.title'} values={{x:'', bold: (str) => <br/>}} /> </h3> 
        <p><InjectMessage id={'global.onboarding.subtitle'} /></p> 
      </div>
      <div className="banner_image">
        <img src="/images/onboarding/BYcmVgqmFmqHywEgcyVH.png"/>
      </div>
    </div>
    );
}
export default Slide1;

