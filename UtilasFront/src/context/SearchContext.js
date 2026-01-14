import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {API_URL, BASE_API_URL} from '../config';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    
    // Abort controller ref for cancelling pending requests
    const abortControllerRef = useRef(null);

    const openGlobalSearch = useCallback(() => {
        setIsGlobalSearchOpen(true);
    }, []);  

    const closeGlobalSearch = useCallback(() => {
        setIsGlobalSearchOpen(false);
    }, []);

    const performSearch = useCallback(async (query) => {
        setSearchQuery(query);

        if (!query || query.trim() === '') {
            setSearchResults(null);
            setSearchError(null);
            setIsSearching(false);
            return;
        }

        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await fetch(
                `${BASE_API_URL}/${API_URL}/search-tools?q=${encodeURIComponent(query.trim())}`,
                { signal: abortControllerRef.current.signal }
            );

            if (!response.ok) {
                throw new Error(`Search failed with status ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(Array.isArray(data) ? data : [data]);
        } catch (err) {
            // Ignore abort errors
            if (err.name === 'AbortError') {
                return;
            }
            console.error('Search failed:', err);
            setSearchError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        setSearchQuery('');
        setSearchResults(null);
        setSearchError(null);
        setIsSearching(false);
    }, []);

    const value = {
        searchQuery,
        searchResults,
        isGlobalSearchOpen,
        isSearching,
        searchError,
        openGlobalSearch,
        closeGlobalSearch,
        performSearch,
        clearSearch,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    console.log(BASE_API_URL);
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}


