import { get, post, del } from './http'

// GET /api/groups?search=foo
export async function getGroups(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  const json = await get(`/api/groups${q}`)
  return json?.data?.items ?? []
}

// POST /api/groups
export async function createGroup(groupName) {
  const json = await post('/api/groups', { groupName })
  return json?.data ?? null
}

// DELETE /api/groups/{groupId}
export async function deleteGroup(groupId) {
  const json = await del(`/api/groups/${groupId}`)
  return json?.data?.ok === true
}
