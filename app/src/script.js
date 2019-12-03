import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

import { hexToUtf8 } from 'web3-utils'

import {
  getTokenType,
  getVotingType,
  updateCommitteesMembers,
  deleteCommittee,
} from '../src/lib/committee-utils'

import { getTokenName } from '../src/lib/token-utils'

const INITIAL_STATE = {
  committees: [],
  isSyncing: false,
}

const app = new Aragon()

app.store(async (state, { event, returnValues }) => {
  console.log(state, event, returnValues)
  let nextState = { ...state }

  if (state == null) nextState = INITIAL_STATE

  switch (event) {
    case 'CreateCommittee':
      const {
        committeeAddress: address,
        votingAddress,
        name,
        description,
        initialMembers,
        stakes,
        tokenParams,
        votingParams,
      } = returnValues
      nextState = {
        ...state,
        committees: [
          ...state.committees,
          {
            name: hexToUtf8(name),
            description,
            address,
            votingAddress,
            tokenType: getTokenType(tokenParams),
            votingType: getVotingType(votingParams),
            tokenSymbol: 'TODO',
            tokenName: getTokenName('TODO'),
            members: initialMembers.map((member, i) => [member, stakes[i]]),
          },
        ],
      }
      break
    case 'RemoveCommittee':
      nextState = {
        ...state,
        committees: deleteCommittee(
          state.committees,
          returnValues.committeeAddress
        ),
      }
      break
    case 'RemoveMember':
    case 'AddMember':
      const { member } = returnValues
      nextState = {
        ...state,
        committees: updateCommitteesMembers(
          state.committees,
          returnValues.committeeAddress,
          member,
          event === 'AddMember'
        ),
      }
      break
  }

  return nextState
})
