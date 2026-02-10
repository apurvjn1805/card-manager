export interface CreditCard {
    id: number;
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardType: string;
    createdAt: string;
}

export interface CardFormData {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}
