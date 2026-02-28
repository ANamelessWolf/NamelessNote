import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConfirmationModal, {
  ConfirmationModalType,
  GroupInputModal
} from '../components/common/modals'
import MenuGroupList from '../components/groups/MenuGroupList'
import HomeLayout from '../components/layouts/HomeLayout'
import PropertiesGrid from '../components/properties/PropertiesGrid'
import { formatRichText, getStrings } from '../assets/strings'
import {
  createGroupThunk,
  deleteGroupThunk,
  fetchGroups,
  setSearchTerm
} from '../store/slices/groupsSlice'
import {
  deleteProperty as deletePropertyApi,
  getProperties,
  upsertProperty
} from '../api/properties'

const mapPropertyForGrid = (item) => ({
  id: item.propertyName,
  name: item.propertyName,
  valueHtml: item.valueHtml || '',
  valueText: item.valueText || ''
})

const language = (import.meta.env.VITE_APP_LANGUAGE || 'es').toLowerCase()
const MAX_GROUP_NAME_EXCLUSIVE = 30

export default function HomeView({ onLogout }) {
  const dispatch = useDispatch()
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [properties, setProperties] = useState([])
  const [createModalState, setCreateModalState] = useState({
    open: false,
    value: '',
    touched: false
  })
  const [deleteModalState, setDeleteModalState] = useState({
    open: false,
    groupId: null,
    groupName: ''
  })

  const { items: groups, searchTerm, deletingById, creating } = useSelector(
    (state) => state.groups
  )

  const texts = getStrings(language)

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchGroups(searchTerm))
    }, 250)

    return () => clearTimeout(timer)
  }, [dispatch, searchTerm])

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null)
      setProperties([])
      return
    }

    const exists = groups.some((group) => group._id === selectedGroupId)
    if (!exists) setSelectedGroupId(groups[0]._id)
  }, [groups, selectedGroupId])

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  )

  useEffect(() => {
    const loadProperties = async () => {
      if (!selectedGroup?._id) {
        setProperties([])
        return
      }

      const items = await getProperties(selectedGroup._id)
      setProperties(items.map(mapPropertyForGrid))
    }

    loadProperties()
  }, [selectedGroup?._id])

  const openCreateGroupModal = () => {
    setCreateModalState({
      open: true,
      value: '',
      touched: false
    })
  }

  const closeCreateGroupModal = () => {
    if (creating) return

    setCreateModalState({
      open: false,
      value: '',
      touched: false
    })
  }

  const onCreateGroupNameChange = (value) => {
    setCreateModalState((prev) => ({
      ...prev,
      value,
      touched: prev.touched
    }))
  }

  const confirmCreateGroup = async () => {
    const trimmedName = createModalState.value.trim()
    const hasLengthError = trimmedName.length >= MAX_GROUP_NAME_EXCLUSIVE

    if (!trimmedName || hasLengthError) {
      setCreateModalState((prev) => ({ ...prev, touched: true }))
      return
    }

    const result = await dispatch(createGroupThunk(trimmedName))

    if (result.meta.requestStatus === 'fulfilled' && result.payload?._id) {
      setSelectedGroupId(result.payload._id)
      closeCreateGroupModal()
    }
  }

  const closeDeleteModal = () => {
    setDeleteModalState({
      open: false,
      groupId: null,
      groupName: ''
    })
  }

  const removeGroup = (groupId) => {
    const group = groups.find((item) => item._id === groupId)

    setDeleteModalState({
      open: true,
      groupId,
      groupName: group?.groupName || ''
    })
  }

  const confirmDeleteGroup = async () => {
    if (!deleteModalState.groupId) return

    await dispatch(deleteGroupThunk(deleteModalState.groupId))
    closeDeleteModal()
  }

  const addProperty = async ({ name, value }) => {
    if (!selectedGroup?._id) return
    await upsertProperty(selectedGroup._id, { propertyName: name, valueHtml: value })
    const items = await getProperties(selectedGroup._id)
    setProperties(items.map(mapPropertyForGrid))
  }

  const deleteProperty = async (propertyId) => {
    if (!selectedGroup?._id) return
    await deletePropertyApi(selectedGroup._id, propertyId)
    const items = await getProperties(selectedGroup._id)
    setProperties(items.map(mapPropertyForGrid))
  }

  const updateProperty = async (propertyId, value) => {
    if (!selectedGroup?._id) return
    await upsertProperty(selectedGroup._id, {
      propertyName: propertyId,
      valueHtml: value
    })
    const items = await getProperties(selectedGroup._id)
    setProperties(items.map(mapPropertyForGrid))
  }

  const isDeletingSelectedGroup = deleteModalState.groupId
    ? Boolean(deletingById[deleteModalState.groupId])
    : false

  const createGroupName = createModalState.value
  const trimmedCreateGroupName = createGroupName.trim()
  const createGroupLengthError =
    trimmedCreateGroupName.length >= MAX_GROUP_NAME_EXCLUSIVE
      ? formatRichText(texts.modals.createGroup.lengthError, {
          max: MAX_GROUP_NAME_EXCLUSIVE
        })
      : ''

  const createGroupRequiredError =
    createModalState.touched && !trimmedCreateGroupName
      ? texts.modals.createGroup.requiredError
      : ''

  const createGroupErrorText = createGroupRequiredError || createGroupLengthError

  return (
    <>
      <HomeLayout
        title="Home View"
        onLogout={onLogout}
        sidebar={
          <MenuGroupList
            groups={groups}
            selectedGroupId={selectedGroup?._id}
            onSelectGroup={setSelectedGroupId}
            onCreateGroup={openCreateGroupModal}
            onDeleteGroup={removeGroup}
            deletingById={deletingById}
            searchTerm={searchTerm}
            onSearchChange={(value) => dispatch(setSearchTerm(value))}
          />
        }
        content={
          <PropertiesGrid
            groupName={selectedGroup?.groupName || 'Sin grupo seleccionado'}
            properties={properties}
            onAddProperty={addProperty}
            onDeleteProperty={deleteProperty}
            onUpdateProperty={updateProperty}
          />
        }
      />

      <GroupInputModal
        open={createModalState.open}
        title={texts.modals.createGroup.title}
        instructions={formatRichText(texts.modals.createGroup.instructions, {
          max: MAX_GROUP_NAME_EXCLUSIVE
        })}
        value={createGroupName}
        onChange={onCreateGroupNameChange}
        onConfirm={confirmCreateGroup}
        onCancel={closeCreateGroupModal}
        okLabel={texts.common.ok}
        cancelLabel={texts.common.cancel}
        inputLabel={texts.modals.createGroup.inputLabel}
        inputPlaceholder={texts.modals.createGroup.inputPlaceholder}
        errorText={createGroupErrorText}
        maxLength={MAX_GROUP_NAME_EXCLUSIVE - 1}
        loading={creating}
      />

      <ConfirmationModal
        open={deleteModalState.open}
        type={ConfirmationModalType.YesNo}
        title={texts.modals.deleteGroup.title}
        message={formatRichText(texts.modals.deleteGroup.description, {
          groupName: deleteModalState.groupName || selectedGroup?.groupName || ''
        })}
        labels={texts.common}
        onConfirm={confirmDeleteGroup}
        onReject={closeDeleteModal}
        onClose={closeDeleteModal}
        loading={isDeletingSelectedGroup}
      />
    </>
  )
}
