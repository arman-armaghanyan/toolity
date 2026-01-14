import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL, BASE_API_URL } from '../config';

const ToolsContext = createContext(null);

export function ToolsProvider({ children }) {
    const { isLoading, data: tools, error } = useQuery({
        queryKey: ['tools'],
        queryFn: () => {
            return fetch(`${BASE_API_URL}/${API_URL}`)
                .then((res) => res.json());
        }
    });

    const value = {
        tools,
        isLoading,
        error,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
}

export function useTools() {
    const context = useContext(ToolsContext);
    if (!context) {
        throw new Error('useTools must be used within a ToolsProvider');
    }
    return context;
}

