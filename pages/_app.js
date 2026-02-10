import '../styles/globals.css'
import { CardProvider } from '../src/context/CardContext';

export default function App({ Component, pageProps }) {
    return (
        <CardProvider>
            <Component {...pageProps} />
        </CardProvider>
    );
}
