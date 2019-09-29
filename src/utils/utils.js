export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const firsts = (s, n) => {
  if (typeof s !== 'string') return ''
  if (typeof n !== 'number') n=3;
  return s.toUpperCase().slice(0,n)
}

export const arrToObj  = (a = []) => a.reduce((prev,act) => { prev[act] = act; return prev; } , {});



export const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
export const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
