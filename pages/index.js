import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
    const [cards, setCards] = useState([])
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')

    // Load cards from localStorage on mount
    useEffect(() => {
        const savedCards = localStorage.getItem('cards')
        if (savedCards) {
            setCards(JSON.parse(savedCards))
        }
    }, [])

    // Save cards to localStorage whenever they change
    useEffect(() => {
        if (cards.length > 0 || localStorage.getItem('cards')) {
            localStorage.setItem('cards', JSON.stringify(cards))
        }
    }, [cards])

    const addCard = (e) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return

        const newCard = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        }

        setCards([newCard, ...cards])
        setTitle('')
        setContent('')
    }

    const deleteCard = (id) => {
        setCards(cards.filter(card => card.id !== id))
    }

    const startEdit = (card) => {
        setEditingId(card.id)
        setEditTitle(card.title)
        setEditContent(card.content)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditTitle('')
        setEditContent('')
    }

    const saveEdit = (id) => {
        if (!editTitle.trim() || !editContent.trim()) return

        setCards(cards.map(card =>
            card.id === id
                ? { ...card, title: editTitle.trim(), content: editContent.trim() }
                : card
        ))
        cancelEdit()
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <Head>
                <title>Cards Manager - Organize Your Ideas</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="container">
                <header className="header">
                    <h1>Cards Manager</h1>
                    <p>Organize your thoughts, ideas, and tasks beautifully</p>
                </header>

                <section className="add-card-section">
                    <form onSubmit={addCard}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Card Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                            <textarea
                                className="input-field"
                                placeholder="Card Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={500}
                            />
                        </div>
                        <button type="submit" className="btn">
                            ✨ Add Card
                        </button>
                    </form>
                </section>

                {cards.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3>No cards yet</h3>
                        <p>Create your first card to get started!</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className={`card ${editingId === card.id ? 'edit-mode' : ''}`}
                            >
                                {editingId === card.id ? (
                                    <>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            maxLength={100}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <textarea
                                            className="input-field"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            maxLength={500}
                                            style={{ marginBottom: '1rem' }}
                                        />
                                        <div className="edit-actions">
                                            <button
                                                className="btn"
                                                onClick={() => saveEdit(card.id)}
                                            >
                                                💾 Save
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={cancelEdit}
                                            >
                                                ✖ Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="card-header">
                                            <h3>{card.title}</h3>
                                            <div className="card-actions">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => startEdit(card)}
                                                    title="Edit card"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    onClick={() => deleteCard(card.id)}
                                                    title="Delete card"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <p>{card.content}</p>
                                        <div className="card-timestamp">
                                            Created {formatDate(card.createdAt)}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
