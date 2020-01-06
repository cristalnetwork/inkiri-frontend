import React from 'react'
import * as globalCfg from '@app/configs/global';

const ItemAmount = ({amount, symbol, small}) => {
    
    const my_symbol = symbol?symbol:globalCfg.currency.fiat.symbol;
    const classname = small?'price-tag_small':'';
    return(
      <span className={classname+" price-tag price-tag-billing"}>
        <span className="price-tag price-tag-symbol">
          {my_symbol} 
        </span>
        <span className="price-tag price-tag-fraction">
          {parseFloat(amount).toFixed(2)}
        </span>
      </span>
                         
    )
    
}
//
export default (ItemAmount)