import { createRoot } from 'react-dom/client';
import { CoverScreen } from './screens/CoverScreen';
import './index.css';

createRoot(document.getElementById('root')!).render(<CoverScreen language="ko" />);
