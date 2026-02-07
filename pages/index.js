import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
    const [cards, setCards] = useState([])
    const [cardholderName, setCardholderName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [errors, setErrors] = useState({})
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({})

    // Load cards from localStorage on mount
    useEffect(() => {
        const savedCards = localStorage.getItem('creditCards')
        if (savedCards) {
            setCards(JSON.parse(savedCards))
        }
    }, [])

    // Save cards to localStorage whenever they change
    useEffect(() => {
        if (cards.length > 0 || localStorage.getItem('creditCards')) {
            localStorage.setItem('creditCards', JSON.stringify(cards))
        }
    }, [cards])

    // Luhn algorithm for card number validation
    const validateCardNumber = (number) => {
        const cleaned = number.replace(/\s/g, '')
        if (!/^\d+$/.test(cleaned)) return false
        if (cleaned.length < 13 || cleaned.length > 19) return false

        let sum = 0
        let isEven = false
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i])
            if (isEven) {
                digit *= 2
                if (digit > 9) digit -= 9
            }
            sum += digit
            isEven = !isEven
        }
        return sum % 10 === 0
    }

    // Detect card type
    const detectCardType = (number) => {
        const cleaned = number.replace(/\s/g, '')
        if (/^4/.test(cleaned)) return 'Visa'
        if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
        if (/^3[47]/.test(cleaned)) return 'American Express'
        if (/^6(?:011|5)/.test(cleaned)) return 'Discover'
        return 'Unknown'
    }

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '')
        const chunks = cleaned.match(/.{1,4}/g) || []
        return chunks.join(' ')
    }

    // Format expiry date as MM/YY
    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '')
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
        }
        return cleaned
    }

    // Validate expiry date
    const validateExpiryDate = (expiry) => {
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return false
        const [month, year] = expiry.split('/').map(Number)
        if (month < 1 || month > 12) return false

        const now = new Date()
        const currentYear = now.getFullYear() % 100
        const currentMonth = now.getMonth() + 1

        if (year < currentYear) return false
        if (year === currentYear && month < currentMonth) return false
        return true
    }

    // Validate CVV
    const validateCVV = (cvv, cardType) => {
        if (cardType === 'American Express') {
            return /^\d{4}$/.test(cvv)
        }
        return /^\d{3}$/.test(cvv)
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!cardholderName.trim()) {
            newErrors.cardholderName = 'Cardholder name is required'
        } else if (!/^[a-zA-Z\s]+$/.test(cardholderName)) {
            newErrors.cardholderName = 'Name should contain only letters'
        }

        if (!cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required'
        } else if (!validateCardNumber(cardNumber)) {
            newErrors.cardNumber = 'Invalid card number'
        }

        if (!expiryDate.trim()) {
            newErrors.expiryDate = 'Expiry date is required'
        } else if (!validateExpiryDate(expiryDate)) {
            newErrors.expiryDate = 'Invalid or expired date (MM/YY)'
        }

        const cardType = detectCardType(cardNumber)
        if (!cvv.trim()) {
            newErrors.cvv = 'CVV is required'
        } else if (!validateCVV(cvv, cardType)) {
            newErrors.cvv = cardType === 'American Express' ? 'CVV must be 4 digits' : 'CVV must be 3 digits'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const addCard = (e) => {
        e.preventDefault()
        if (!validateForm()) return

        const newCard = {
            id: Date.now(),
            cardholderName: cardholderName.trim(),
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiryDate: expiryDate,
            cvv: cvv,
            cardType: detectCardType(cardNumber),
            createdAt: new Date().toISOString()
        }

        setCards([newCard, ...cards])
        setCardholderName('')
        setCardNumber('')
        setExpiryDate('')
        setCvv('')
        setErrors({})
    }

    const deleteCard = (id) => {
        setCards(cards.filter(card => card.id !== id))
    }

    const startEdit = (card) => {
        setEditingId(card.id)
        setEditData({
            cardholderName: card.cardholderName,
            cardNumber: formatCardNumber(card.cardNumber),
            expiryDate: card.expiryDate,
            cvv: card.cvv
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditData({})
        setErrors({})
    }

    const saveEdit = (id) => {
        const newErrors = {}

        if (!editData.cardholderName?.trim()) {
            newErrors.cardholderName = 'Cardholder name is required'
        } else if (!/^[a-zA-Z\s]+$/.test(editData.cardholderName)) {
            newErrors.cardholderName = 'Name should contain only letters'
        }

        if (!editData.cardNumber?.trim()) {
            newErrors.cardNumber = 'Card number is required'
        } else if (!validateCardNumber(editData.cardNumber)) {
            newErrors.cardNumber = 'Invalid card number'
        }

        if (!editData.expiryDate?.trim()) {
            newErrors.expiryDate = 'Expiry date is required'
        } else if (!validateExpiryDate(editData.expiryDate)) {
            newErrors.expiryDate = 'Invalid or expired date'
        }

        const cardType = detectCardType(editData.cardNumber || '')
        if (!editData.cvv?.trim()) {
            newErrors.cvv = 'CVV is required'
        } else if (!validateCVV(editData.cvv, cardType)) {
            newErrors.cvv = cardType === 'American Express' ? 'CVV must be 4 digits' : 'CVV must be 3 digits'
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        setCards(cards.map(card =>
            card.id === id
                ? {
                    ...card,
                    cardholderName: editData.cardholderName.trim(),
                    cardNumber: editData.cardNumber.replace(/\s/g, ''),
                    expiryDate: editData.expiryDate,
                    cvv: editData.cvv,
                    cardType: detectCardType(editData.cardNumber)
                }
                : card
        ))
        cancelEdit()
    }

    const maskCardNumber = (number) => {
        const last4 = number.slice(-4)
        return '•••• •••• •••• ' + last4
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

    const handleCardNumberChange = (value) => {
        const formatted = formatCardNumber(value.replace(/\s/g, '').slice(0, 19))
        setCardNumber(formatted)
    }

    const handleExpiryChange = (value) => {
        const formatted = formatExpiryDate(value)
        setExpiryDate(formatted)
    }

    const handleEditCardNumberChange = (value) => {
        const formatted = formatCardNumber(value.replace(/\s/g, '').slice(0, 19))
        setEditData({ ...editData, cardNumber: formatted })
    }

    const handleEditExpiryChange = (value) => {
        const formatted = formatExpiryDate(value)
        setEditData({ ...editData, expiryDate: formatted })
    }

    return (
        <>
            <Head>
                <title>Card Manager - Secure Card Storage</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="container">
                <header className="header">
                    <h1>💳 Card Manager</h1>
                    <p>Securely manage your payment cards</p>
                </header>

                <section className="add-card-section">
                    <form onSubmit={addCard}>
                        <div className="input-group">
                            <div className="form-field">
                                <input
                                    type="text"
                                    className={`input-field ${errors.cardholderName ? 'error' : ''}`}
                                    placeholder="Cardholder Name"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e.target.value)}
                                    maxLength={50}
                                />
                                {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
                            </div>

                            <div className="form-field">
                                <input
                                    type="text"
                                    className={`input-field ${errors.cardNumber ? 'error' : ''}`}
                                    placeholder="Card Number"
                                    value={cardNumber}
                                    onChange={(e) => handleCardNumberChange(e.target.value)}
                                />
                                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <input
                                        type="text"
                                        className={`input-field ${errors.expiryDate ? 'error' : ''}`}
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => handleExpiryChange(e.target.value)}
                                        maxLength={5}
                                    />
                                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                </div>

                                <div className="form-field">
                                    <input
                                        type="text"
                                        className={`input-field ${errors.cvv ? 'error' : ''}`}
                                        placeholder="CVV"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn">
                            💳 Add Card
                        </button>
                    </form>
                </section>

                {cards.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💳</div>
                        <h3>No cards saved</h3>
                        <p>Add your first payment card to get started!</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className={`card credit-card ${editingId === card.id ? 'edit-mode' : ''}`}
                            >
                                {editingId === card.id ? (
                                    <>
                                        <div className="form-field">
                                            <input
                                                type="text"
                                                className={`input-field ${errors.cardholderName ? 'error' : ''}`}
                                                placeholder="Cardholder Name"
                                                value={editData.cardholderName || ''}
                                                onChange={(e) => setEditData({ ...editData, cardholderName: e.target.value })}
                                                maxLength={50}
                                            />
                                            {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
                                        </div>

                                        <div className="form-field">
                                            <input
                                                type="text"
                                                className={`input-field ${errors.cardNumber ? 'error' : ''}`}
                                                placeholder="Card Number"
                                                value={editData.cardNumber || ''}
                                                onChange={(e) => handleEditCardNumberChange(e.target.value)}
                                            />
                                            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                                        </div>

                                        <div className="form-row">
                                            <div className="form-field">
                                                <input
                                                    type="text"
                                                    className={`input-field ${errors.expiryDate ? 'error' : ''}`}
                                                    placeholder="MM/YY"
                                                    value={editData.expiryDate || ''}
                                                    onChange={(e) => handleEditExpiryChange(e.target.value)}
                                                    maxLength={5}
                                                />
                                                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                            </div>

                                            <div className="form-field">
                                                <input
                                                    type="text"
                                                    className={`input-field ${errors.cvv ? 'error' : ''}`}
                                                    placeholder="CVV"
                                                    value={editData.cvv || ''}
                                                    onChange={(e) => setEditData({ ...editData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                                    maxLength={4}
                                                />
                                                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                            </div>
                                        </div>

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
                                            <div className="card-type-badge">{card.cardType}</div>
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

                                        <div className="card-number">{maskCardNumber(card.cardNumber)}</div>

                                        <div className="card-details">
                                            <div className="card-detail">
                                                <span className="detail-label">Cardholder</span>
                                                <span className="detail-value">{card.cardholderName}</span>
                                            </div>
                                            <div className="card-detail">
                                                <span className="detail-label">Expires</span>
                                                <span className="detail-value">{card.expiryDate}</span>
                                            </div>
                                        </div>

                                        <div className="card-timestamp">
                                            Added {formatDate(card.createdAt)}
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
