import React, {Component} from 'react'
import { connect } from 'react-redux'
import * as balanceRedux from '@app/redux/models/balance'
import { bindActionCreators } from 'redux';
import { Spin } from 'antd';


class UserBalance extends Component  {
    UNSAFE_componentWillMount() {
        const {userId, loadBalance} = this.props;
        loadBalance(userId)
    }

    componentDidUpdate(prevProps, prevState) 
    {
        const {userId, loadBalance} = this.props;
        if(prevProps.userId !== userId) {
            loadBalance(userId)
        }
    }
    // componentWillReceiveProps(newProps) {
    //     const {userId, loadBalance} = this.props;
    //     if(newProps.userId !== userId) {
    //         loadBalance(newProps.userId)
    //     }
    // }
    
    render() {
        const {userId, balance, loading} = this.props;
        // console.log(' >> userBalance::render userID: ', userId, ' | balance: ', balance)
        return (
        <>
            {
                loading? <Spin size={'small'} />: <b>{balance}</b>
            }
        </>
        )
    }
}

export default connect(
    (state)=> ({
        balance:   balanceRedux.userBalanceFormatted(state),
        loading:   balanceRedux.isLoading(state),
    }),
    (dispatch) => ({
        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(UserBalance)