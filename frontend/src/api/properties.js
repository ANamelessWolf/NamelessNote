import { get, post, del } from './http'

// GET /api/groups/{groupId}/properties
export async function getProperties(groupId) {
  const json = await get(`/api/groups/${groupId}/properties`)
  return json?.data?.items ?? []
}

// POST /api/groups/{groupId}/properties
export async function upsertProperty(groupId, { propertyName, valueHtml }) {
  const json = await post(`/api/groups/${groupId}/properties`, { propertyName, valueHtml })
  return json?.data?.ok === true
}

// DELETE /api/groups/{groupId}/properties/{propertyName}
export async function deleteProperty(groupId, propertyName) {
  const json = await del(
    `/api/groups/${groupId}/properties/${encodeURIComponent(propertyName)}`
  )
  return json?.data?.ok === true
}
