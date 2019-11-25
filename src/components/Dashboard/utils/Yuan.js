import React from 'react';
// import { yuan } from '../components/Charts';

export default class Yuan extends React.Component {
  

  constructor(props) {
    super(props)
    // this.main = HTMLSpanElement | undefined | null = null;  
  }

  componentDidMount() {
    this.renderToHtml();
  }

  componentDidUpdate() {
    this.renderToHtml();
  }

  yuan = (val) => `BRL ${parseFloat(val).toFixed(1)}`;

  renderToHtml = () => {
    const { children } = this.props;
    if (this.main) {
      this.main.innerHTML = this.yuan(children);
    }
  };

  render() {
    return (
      <span
        ref={ref => {
          this.main = ref;
        }}
      />
    );
  }
}
