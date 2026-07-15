const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const data = await res.json()
      detail = data.detail || detail
    } catch {
      // response had no JSON body
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login(email, password) {
    const body = new URLSearchParams()
    body.append('username', email)
    body.append('password', password)
    return request('/login', { method: 'POST', body })
  },
  register(email, password) {
    return request('/users/', { method: 'POST', body: JSON.stringify({ email, password }) })
  },
  getUser(id) {
    return request(`/users/${id}`)
  },
  getPosts({ limit = 10, skip = 0, search = '' } = {}) {
    const params = new URLSearchParams({ limit, skip, search })
    return request(`/posts/?${params.toString()}`)
  },
  createPost(data) {
    return request('/posts/', { method: 'POST', body: JSON.stringify(data) })
  },
  updatePost(id, data) {
    return request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deletePost(id) {
    return request(`/posts/${id}`, { method: 'DELETE' })
  },
  upvote(post_id) {
    return request('/vote/upvote', { method: 'POST', body: JSON.stringify({ post_id }) })
  },
  downvote(post_id) {
    return request('/vote/downvote', { method: 'POST', body: JSON.stringify({ post_id }) })
  },
  addComment(post_id, comment) {
    return request('/comment/', { method: 'POST', body: JSON.stringify({ post_id, comment }) })
  },
  updateComment(id, comment) {
    return request(`/comment/${id}`, { method: 'PUT', body: JSON.stringify({ comment }) })
  },
  deleteComment(id) {
    return request(`/comment/${id}`, { method: 'DELETE' })
  },
}
