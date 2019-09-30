import React from 'react'
import { Select } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as accountsRedux from '@app/redux/models/accounts'

const { Option } = Select;

const SelectUser = ({accounts, actualAccountName, onChange, loading}) => {
    
    const sendAccount = (name) => {
        const selectedAccount = accounts.find(acc => acc.key === name)
        if(typeof onChange === 'function') {
            onChange(selectedAccount)
        }
    }
    
    return (
        <Select defaultValue={actualAccountName} style={{ width: '100%' }} onChange={sendAccount} loading={loading} placeholder={'Select account'}>
            { accounts.map(acc => <Option key={acc.key} value={acc.key}>{acc.key}</Option> )}
        </Select>
    )
}

export default connect(
    (state)=> ({
        accounts:   accountsRedux.accounts(state),
        actualAccountName: loginRedux.actualAccountName(state),
        isLoading: loginRedux.isLoading(state)
    })
)(SelectUser)