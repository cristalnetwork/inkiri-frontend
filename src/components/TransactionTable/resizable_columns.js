import React, { useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { Table } from 'antd';

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

//

export const ResizeableTable = props => {
   
  const [columns, setColumns] = useState(props.columns_def)
  useEffect(() => {
      setColumns(props.columns_def);
  }, [props.columns_def]);

  const components = {
    header: {
      cell: ResizeableTitle
    },
  };

  const handleResize = index => (e, { size }) => {
    const nextColumns = [...columns];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setColumns( nextColumns );
  };

  const visible_columns = columns.map((col, index) => ({
    ...col,
    onHeaderCell: column => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  return <Table bordered components={components} columns={visible_columns} {...props} />;
  

};


