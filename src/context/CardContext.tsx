import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CreditCard, CardFormData } from '../models/credit-card.model';

interface CardContextType {
    cards: CreditCard[];
    addCard: (cardData: CardFormData) => void;
    updateCard: (id: number, cardData: Partial<CardFormData>) => void;
    deleteCard: (id: number) => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export function CardProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const STORAGE_KEY = 'creditCards';

    // Load cards from localStorage on mount
    useEffect(() => {
        const savedCards = localStorage.getItem(STORAGE_KEY);
        if (savedCards) {
            try {
                setCards(JSON.parse(savedCards));
            } catch (error) {
                console.error('Failed to parse cards from localStorage:', error);
            }
        }
    }, []);

    // Save cards to localStorage whenever they change
    useEffect(() => {
        if (cards.length > 0) { // Avoid overwriting with empty array on initial load if logic was different, but here it's fine as we load first
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        }
    }, [cards]);

    const addCard = (cardData: CardFormData) => {
        const newCard: CreditCard = {
            ...cardData,
            id: Date.now(),
            cardType: 'unknown', // You might want to implement card type detection logic here or in the form
            createdAt: new Date().toISOString()
        };

        // Simple card type detection based on number (basic example)
        if (cardData.cardNumber.startsWith('4')) newCard.cardType = 'Visa';
        else if (cardData.cardNumber.startsWith('5')) newCard.cardType = 'MasterCard';
        else if (cardData.cardNumber.startsWith('3')) newCard.cardType = 'Amex';

        setCards(prevCards => {
            const updatedCards = [newCard, ...prevCards];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards)); // Immediate save for safety
            return updatedCards;
        });
    };

    const updateCard = (id: number, cardData: Partial<CardFormData>) => {
        setCards(prevCards => {
            const updatedCards = prevCards.map(card =>
                card.id === id ? { ...card, ...cardData } : card
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
            return updatedCards;
        });
    };

    const deleteCard = (id: number) => {
        setCards(prevCards => {
            const updatedCards = prevCards.filter(card => card.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
            return updatedCards;
        });
    };

    return (
        <CardContext.Provider value={{ cards, addCard, updateCard, deleteCard }}>
            {children}
        </CardContext.Provider>
    );
}

export function useCards() {
    const context = useContext(CardContext);
    if (context === undefined) {
        throw new Error('useCards must be used within a CardProvider');
    }
    return context;
}
