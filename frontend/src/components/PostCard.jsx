import { useState } from 'react'
import { api } from '../api'

export default function PostCard({ post, currentUser, onChanged }) {
  const { Post: p, up_votes, down_votes, comments, my_vote } = post
  const isOwner = currentUser && currentUser.id === p.owner_id

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(p.title)
  const [content, setContent] = useState(p.content)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  async function handleVote(direction) {
    setError('')
    try {
      if (direction === 'up') await api.upvote(p.id)
      else await api.downvote(p.id)
      // Reload so up_votes/down_votes/my_vote reflect the server's toggle.
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.updatePost(p.id, { title, content, published: p.published })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDeletePost() {
    if (!confirm('Delete this post?')) return
    setBusy(true)
    setError('')
    try {
      await api.deletePost(p.id)
      onChanged()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setError('')
    try {
      await api.addComment(p.id, commentText)
      setCommentText('')
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSaveComment(commentId) {
    try {
      await api.updateComment(commentId, editingCommentText)
      setEditingCommentId(null)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await api.deleteComment(commentId)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card post-card">
      {editing ? (
        <form onSubmit={handleSaveEdit} className="edit-post-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} required />
          <div className="row-gap">
            <button className="btn btn-primary" type="submit" disabled={busy}>Save</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="post-header">
            <h3>{p.title}</h3>
            {isOwner && (
              <div className="row-gap">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeletePost} disabled={busy}>Delete</button>
              </div>
            )}
          </div>
          <p className="post-content">{p.content}</p>
          <p className="post-meta">
            by {p.owner?.email ?? `user #${p.owner_id}`} · {new Date(p.created_at).toLocaleString()}
          </p>
        </>
      )}

      {error && <p className="error">{error}</p>}

      <div className="vote-row">
        <button
          className={`btn vote-btn btn-sm${my_vote === 'up' ? ' vote-up active' : ''}`}
          onClick={() => handleVote('up')}
        >
          ▲ {up_votes}
        </button>
        <button
          className={`btn vote-btn btn-sm${my_vote === 'down' ? ' vote-down active' : ''}`}
          onClick={() => handleVote('down')}
        >
          ▼ {down_votes}
        </button>
      </div>

      <div className="comments">
        <h4>Comments</h4>
        <ul>
          {(comments || []).map((c) =>
            editingCommentId === c.id ? (
              <li key={c.id}>
                <input
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => handleSaveComment(c.id)}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingCommentId(null)}>Cancel</button>
              </li>
            ) : (
              <li key={c.id}>
                {c.comment}
                {currentUser && c.user_id === currentUser.id && (
                  <span className="comment-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingCommentId(c.id)
                        setEditingCommentText(c.comment)
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                  </span>
                )}
              </li>
            ),
          )}
          {(comments || []).length === 0 && <li className="comment-empty">No comments yet.</li>}
        </ul>
        <form className="comment-form" onSubmit={handleAddComment}>
          <input
            placeholder="Add a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" type="submit">Comment</button>
        </form>
      </div>
    </div>
  )
}
