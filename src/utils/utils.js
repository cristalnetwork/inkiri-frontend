export const sliceAndJoinMemo = (s, extra) => {
  if (typeof s !== 'string') return ''
  return cleanMemo(s) + '|' + extra.trim().slice(0,20)
}

export const cleanMemo = (s) => {
  if (typeof s !== 'string') return ''
  return s.trim().replace(/\|/g, "-").slice(0,50);
}

export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const trimCenter = (s, start, end) => {
  if (typeof s !== 'string') return ''
  if (typeof start !== 'number') start=4;
  if (typeof end !== 'number') end=4;
  return s.toUpperCase().slice(0,start) + '...' + s.toUpperCase().slice(s.length-end,s.length)
}

export const firsts = (s, n) => {
  if (typeof s !== 'string') return ''
  if (typeof n !== 'number') n=3;
  return s.toUpperCase().slice(0,n)
}

export const leadingZeros = (s, n) => {
  if (typeof s !== 'string') 
    s=s.toString();
  if (typeof n !== 'number') n=3;
  return ('00000000'+s).substr(n);
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

export const objectToString = (obj) => {
  return Object.keys(obj).map(function(key, index) {
    return `${key}:${obj[key]}`
  }).join(', ');
}