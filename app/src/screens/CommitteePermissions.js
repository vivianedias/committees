import React, { useState, useEffect } from 'react'
import { useAragonApi } from '@aragon/api-react'

import PropTypes from 'prop-types'

import {
  DataView,
  Tag,
  IconTrash,
  textStyle,
  Button,
  IconPlus,
  Info,
  GU,
  Link,
  useTheme,
  useLayout,
} from '@aragon/ui'

import { usePanelManagement } from '../components/SidePanels/'

import { getRoles, getPermissions, getAclHandler } from '../lib/acl-utils'

import LocalAppBadge from '../components/LocalIdentityBadge/LocalAppBadge'

const emptyState = type => (
  <div
    css={`
      ${textStyle('title2')}
    `}
  >
    No {type === 'Individual' ? 'individual' : 'group'} permissions
  </div>
)

const CommitteePermissions = React.memo(({ tmAddress, votingAddress }) => {
  const { api, appState } = useAragonApi()
  const { isSyncing } = appState

  const [tokenPermissions, setTokenPermissions] = useState(null)
  const [votingPermissions, setVotingPermissions] = useState(null)
  const [roleRegistry, setRoleRegistry] = useState({})

  const { setUpNewPermission } = usePanelManagement()

  useEffect(() => {
    api &&
      getRoles(api).then(
        roleRegistry => {
          setRoleRegistry(roleRegistry)
        },
        err => console.log(err)
      )
    api &&
      getPermissions(api, {
        tokenManager: tmAddress,
        voting: votingAddress,
      }).then(res => {
        setTokenPermissions(res[0])
        setVotingPermissions(res[1])
      })
  }, [isSyncing])

  const deletePermissionHandler = async (entity, app, role) => {
    const aclHandler = await getAclHandler(api)
    aclHandler
      .revokePermission(entity.toLowerCase(), app.toLowerCase(), role)
      .toPromise()
  }

  return (
    <React.Fragment>
      <Info
        mode="warning"
        css={`
          margin-bottom: ${2 * GU}px;
        `}
      >
        See{' '}
        <Link href="https://github.com/P2PModels/committees/issues/17">
          Issue #17
        </Link>
        . At the moment, permission <b>granting</b> and permission{' '}
        <b>removal</b> only work for <b>Externally Owned Accounts (EOA)</b> that
        are the managers of thoose permissions. If the permission manager is set
        to a <b>Token Manager</b> or a <b>Voting app</b>, you have to
        grant/revoke it using the native permissions app.
      </Info>
      <PermissionsTable
        type="Individual"
        permissions={tokenPermissions}
        roleRegistry={roleRegistry}
        address={tmAddress}
        setUpNewPermission={setUpNewPermission}
        deletePermissionHandler={deletePermissionHandler}
      />
      <PermissionsTable
        type="Group"
        permissions={votingPermissions}
        roleRegistry={roleRegistry}
        address={votingAddress}
        setUpNewPermission={setUpNewPermission}
        deletePermissionHandler={deletePermissionHandler}
      />
    </React.Fragment>
  )
})

const PermissionsTable = ({
  type,
  permissions,
  roleRegistry,
  address,
  setUpNewPermission,
  deletePermissionHandler,
}) => (
  <DataView
    heading={
      <PermissionHeader
        title={`${type} permissions`}
        permissions={permissions}
        btnLabel="New permission"
        onClickBtn={() => setUpNewPermission(type, address)}
      />
    }
    status={permissions ? 'default' : 'loading'}
    statusEmpty={emptyState(type)}
    fields={['role', 'on app', '']}
    entries={permissions || []}
    renderEntry={({ app, role }) => [
      <span>{roleRegistry[role]}</span>,
      <LocalAppBadge appAddress={app} />,
      null,
    ]}
    renderEntryActions={({ entity, app, role }) => (
      <EntryActions
        onRevokePermission={() => deletePermissionHandler(entity, app, role)}
      />
    )}
  />
)

const EntryActions = ({ onRevokePermission }) => {
  const theme = useTheme()
  return (
    <Button
      label="Revoke permission"
      display="icon"
      onClick={onRevokePermission}
      icon={<IconTrash />}
      css={`
        color: ${theme.negative};
      `}
    />
  )
}

const PermissionHeader = ({ title, permissions, btnLabel, onClickBtn }) => {
  const theme = useTheme()
  const { layoutName } = useLayout()

  const compactMode = layoutName === 'small'

  return (
    <React.Fragment>
      <div
        css={`
          display: flex;
          justify-content: space-between;
        `}
      >
        <div
          css={`
              white-space: nowrap;
              text-transform: uppercase;
              ${textStyle('body3')}
              color: ${theme.contentSecondary}
            `}
        >
          {title}
          {permissions && <Tag>{permissions.length}</Tag>}
        </div>
        {btnLabel && (
          <Button
            onClick={onClickBtn}
            mode="strong"
            label={btnLabel}
            icon={<IconPlus />}
            display={compactMode ? 'icon' : 'label'}
          />
        )}
      </div>
    </React.Fragment>
  )
}

CommitteePermissions.propTypes = {
  tmAddress: PropTypes.string,
  votingAddress: PropTypes.string,
}

PermissionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  permissions: PropTypes.array,
  btnLabel: PropTypes.string,
  onClickBtn: PropTypes.func,
}

export default CommitteePermissions
