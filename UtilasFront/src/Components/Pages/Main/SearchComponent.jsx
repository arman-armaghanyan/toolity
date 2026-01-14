import { useEffect } from 'react';
import { useSearch } from '../../../context/SearchContext';
import '../../ComponentStyles/SearchStyles.css';

export function SearchComponent() {
    const { openGlobalSearch, isGlobalSearchOpen } = useSearch();

    // Handle Cmd/Ctrl + K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openGlobalSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [openGlobalSearch]);

    // Determine platform for keyboard hint
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

    return (
        <button 
            className={`header-search ${isGlobalSearchOpen ? 'header-search--disabled' : ''}`}
            onClick={openGlobalSearch}
            disabled={isGlobalSearchOpen}
            aria-label="Open search"
        >
            <svg 
                className="header-search__icon" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="header-search__text">Search</span>
            <kbd className="header-search__shortcut">{shortcutHint}</kbd>
        </button>
    );
}


