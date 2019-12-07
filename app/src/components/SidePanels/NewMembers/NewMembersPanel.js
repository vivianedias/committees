import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'

import { useSidePanelFocusOnReady } from '@aragon/ui'

import { Form, FormField } from '../../Form'
import MembersField from '../../Form/MembersField/MembersField'

import {
  validateMembers,
  decoupleMembers,
  DEFAULT_MEMBER,
} from '../../../lib/committee-utils'
import { isAddress } from 'web3-utils'

const NewMembersPanel = ({ committeeAddress, isCumulative }) => {
  const { api } = useAragonApi()
  const [error, setError] = useState({})
  const [members, setMembers] = useState([DEFAULT_MEMBER])

  const inputRef = useSidePanelFocusOnReady()

  const createMembers = (committeeAddress, addresses, stakes) => {
    api
      .addMembers(committeeAddress, addresses, stakes)
      .subscribe(
        () => console.log('New members transaction completed'),
        err => console.log(err)
      )
  }
  const changeMembers = members => {
    setMembers(members)
  }

  const submitHandler = () => {
    const error = {}
    const errorMsg = validateMembers(members, isAddress)
    if (errorMsg) error.members = errorMsg

    if (Object.keys(error).length) setError({ ...error })
    else {
      createMembers(committeeAddress, ...decoupleMembers(members, isCumulative))
    }
  }

  return (
    <Form onSubmit={submitHandler} submitText="Submit Members">
      <FormField
        required
        label="New Members"
        err={error && error.members}
        input={
          <MembersField
            ref={inputRef}
            accountStake={isCumulative ? 1 : -1}
            members={members}
            onChange={changeMembers}
          />
        }
      />
    </Form>
  )
}

NewMembersPanel.propTypes = {
  committeeAddress: PropTypes.string.isRequired,
  isCumulative: PropTypes.bool.isRequired,
}

export default NewMembersPanel