import { Axis, Chart, Geom, Tooltip } from 'bizcharts';
import React, { Component } from 'react';

import Debounce from 'lodash.debounce';
import autoHeight from '../autoHeight';
import styles from '../index.less';

// export interface BarProps {
//   title: React.ReactNode;
//   color?: string;
//   padding?: [number, number, number, number];
//   height?: number;
//   data: {
//     x: string;
//     y: number;
//   }[];
//   forceFit?: boolean;
//   autoLabel?: boolean;
//   style?: React.CSSProperties;
// }

class Bar extends Component{
  constructor(props) {
    super(props);
    
    this.state = {
      autoHideXLabels: false,
    };

    this.root = undefined;

    this.node = undefined;

  }
  
  

  
  resize = Debounce(() => {
    if (!this.node || !this.node.parentNode) {
      return;
    }
    const canvasWidth = (this.node.parentNode).clientWidth;
    const { data = [], autoLabel = true } = this.props;
    if (!autoLabel) {
      return;
    }
    const minWidth = data.length * 30;
    const { autoHideXLabels } = this.state;

    if (canvasWidth <= minWidth) {
      if (!autoHideXLabels) {
        this.setState({
          autoHideXLabels: true,
        });
      }
    } else if (autoHideXLabels) {
      this.setState({
        autoHideXLabels: false,
      });
    }
  }, 500);

  componentDidMount() {
    window.addEventListener('resize', this.resize, { passive: true });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  handleRoot = (n) => {
    this.root = n;
  };

  handleRef = (n) => {
    this.node = n;
  };

  render() {
    const {
      height = 1,
      title,
      forceFit = true,
      data,
      color = 'rgba(24, 144, 255, 0.85)',
      padding,
    } = this.props;

    const { autoHideXLabels } = this.state;

    const scale = {
      x: {
        type: 'cat',
      },
      y: {
        min: 0,
      },
    };

    // const tooltip: [string, (...args: any[]) => { name, value }] = [
    //   'x*y',
    //   (x, y) => ({
    //     name: x,
    //     value: y,
    //   }),
    // ];

    const tooltip = [
      'x*y',
      (x, y) => ({
        name: x,
        value: y,
      }),
    ];

    return (
      <div className={'chart'} style={{ height }} ref={this.handleRoot}>
        <div ref={this.handleRef}>
          {title && <h4 style={{ marginBottom: 20 }}>{title}</h4>}
          <Chart
            scale={scale}
            height={title ? height - 41 : height}
            forceFit={forceFit}
            data={data}
            padding={padding || 'auto'}
          >
            <Axis
              name="x"
              title={false}
              label={autoHideXLabels ? undefined : {}}
              tickLine={autoHideXLabels ? undefined : {}}
            />
            <Axis name="y" min={0} />
            <Tooltip showTitle={false} crosshairs={false} />
            <Geom type="interval" position="x*y" color={color} tooltip={tooltip} />
          </Chart>
        </div>
      </div>
    );
  }
}

export default autoHeight()(Bar);
