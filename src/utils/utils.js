
export const objectsEqual = (a, b) => {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const a_keys = Object.keys(a);
  const b_keys = Object.keys(b);
  if (a_keys.length != b_keys.length) return false;
  for (var i = 0; i < a_keys.length; ++i) {
    if (a[a_keys[i]] !== b[a_keys[i]]) return false;
  }
  return true;
}


export const objectNullOrEmpty = (o) => {
  if(!o) return true;
  if(Object.keys(o).length==0) return true;
  return false;
}

export const arrayNullOrEmpty = (a) => {
  if(!a) return true;
  if(!Array.isArray(a)) return true;
  if(a.length==0) return true;
  return false;
}
export const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const objectValueOrDefault = (obj, key, _default) =>{
  if(!obj) return _default;
  return obj[key]||_default
}

export const twoLevelObjectValueOrDefault = (obj, key, children_key, _default) =>{
  if(!obj) return _default;
  return objectValueOrDefault(obj[key], children_key, _default)
}

export const sliceAndJoinMemo = (s, extra) => {
  if (typeof s !== 'string') 
    s = '';
  return cleanMemo(s) + '|' + extra.trim().slice(0,20)
}

export const cleanMemo = (s) => {
  if (typeof s !== 'string') 
    s = '';
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

export const firsts = (s, n, uppercase) => {
  if (typeof s !== 'string') return ''
  if (typeof n !== 'number') n=3;
  let text = s.slice(0,n);
  return (uppercase===false)?text:text.toUpperCase();
}

export const leadingZeros = (s, n) => {
  if (typeof s !== 'string') 
    s=s.toString();
  if (typeof n !== 'number') n=3;
  return ('00000000000000000000'+s).substr(n);
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