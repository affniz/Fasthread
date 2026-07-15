import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext.jsx'
import PostCard from '../components/PostCard.jsx'

const PAGE_SIZE = 10

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [skip, setSkip] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getPosts({ limit: PAGE_SIZE, skip, search })
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [skip, search])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  async function handleCreatePost(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await api.createPost({ title, content, published: true })
      setTitle('')
      setContent('')
      if (skip === 0) await loadPosts()
      else setSkip(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (skip === 0) loadPosts()
    else setSkip(0)
  }

  return (
    <div className="feed">
      <form className="card create-post" onSubmit={handleCreatePost}>
        <h2>Create a post</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
        />
        <button className="btn btn-primary" type="submit" disabled={creating}>
          {creating ? 'Posting…' : 'Post'}
        </button>
      </form>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          placeholder="Search posts by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-ghost" type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading posts…</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => (
          <PostCard key={p.Post.id} post={p} currentUser={user} onChanged={loadPosts} />
        ))
      )}

      <div className="pager">
        <button className="btn btn-ghost" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}>
          Previous
        </button>
        <button className="btn btn-ghost" disabled={posts.length < PAGE_SIZE} onClick={() => setSkip(skip + PAGE_SIZE)}>
          Next
        </button>
      </div>
    </div>
  )
}
