export const checkPrice = (rule, value, callback, message) => {
    if (value > 0) {
      callback();
      return;
    }
    callback(message || 'Amount must greater than zero!');
  };