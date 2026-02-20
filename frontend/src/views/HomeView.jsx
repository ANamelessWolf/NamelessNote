import { useMemo, useState } from 'react'
import MenuGroupList from '../components/groups/MenuGroupList'
import HomeLayout from '../components/layouts/HomeLayout'
import PropertiesGrid from '../components/properties/PropertiesGrid'

const initialGroups = [
  {
    id: 'personal',
    name: 'Personal',
    items: [
      { id: 'p1', name: 'API Key', value: '<b>my-secret-api-key-123456789</b>' },
      { id: 'p2', name: 'Email', value: '<i>personal@email.com</i>' }
    ]
  },
  {
    id: 'work',
    name: 'Trabajo',
    items: [
      { id: 'w1', name: 'Servidor', value: '<p>https://api.company.local</p>' },
      { id: 'w2', name: 'Token', value: '<p>token-work-987654321</p>' }
    ]
  }
]

export default function HomeView({ onLogout }) {
  const [groups, setGroups] = useState(initialGroups)
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroups[0].id)

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0],
    [groups, selectedGroupId]
  )

  const createGroup = () => {
    const nextId = `group-${Date.now()}`
    const newGroup = {
      id: nextId,
      name: `Grupo ${groups.length + 1}`,
      items: []
    }
    setGroups((prev) => [...prev, newGroup])
    setSelectedGroupId(nextId)
  }

  const addProperty = ({ name, value }) => {
    const nextProperty = {
      id: `prop-${Date.now()}`,
      name,
      value
    }

    setGroups((prev) =>
      prev.map((group) =>
        group.id === selectedGroup.id
          ? { ...group, items: [...group.items, nextProperty] }
          : group
      )
    )
  }

  const deleteProperty = (propertyId) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              items: group.items.filter((property) => property.id !== propertyId)
            }
          : group
      )
    )
  }

  const updateProperty = (propertyId, value) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === selectedGroup.id
          ? {
              ...group,
              items: group.items.map((property) =>
                property.id === propertyId ? { ...property, value } : property
              )
            }
          : group
      )
    )
  }

  return (
    <HomeLayout
      title="Home View"
      onLogout={onLogout}
      sidebar={
        <MenuGroupList
          groups={groups}
          selectedGroupId={selectedGroup.id}
          onSelectGroup={setSelectedGroupId}
          onCreateGroup={createGroup}
        />
      }
      content={
        <PropertiesGrid
          groupName={selectedGroup.name}
          properties={selectedGroup.items}
          onAddProperty={addProperty}
          onDeleteProperty={deleteProperty}
          onUpdateProperty={updateProperty}
        />
      }
    />
  )
}
