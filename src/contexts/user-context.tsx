'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

const NEXT_PUBLIC_USERNAME = process.env.NEXT_PUBLIC_USERNAME;

type UserContextType = {
    name: string;
    setName: (name: string) => void;
    clearName: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [name, setNameState] = useState<string>(NEXT_PUBLIC_USERNAME || '');

    const setName = (newName: string) => setNameState(newName);
    const clearName = () => setNameState('');

    return (
        <UserContext.Provider value={{ name, setName, clearName }}>
            {children}
        </UserContext.Provider>
    );
};
export const useUser = (): UserContextType => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
};