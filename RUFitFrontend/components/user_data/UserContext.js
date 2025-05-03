// components/user_data/UserContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
import { get_user_profile } from './UserProfileRequests';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // 1) State hooks (always first)
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2) Fetch on mount
    useEffect(() => {
        (async () => {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await get_user_profile();
                setUserData(res.data);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    // 3) Define refreshUser with useCallback (still a hook)
    const refreshUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get_user_profile();
            setUserData(res.data);
            setError(null);
            return res.data;
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 4) Memoize the context value (also a hook)
    const value = useMemo(() => ({
        userData,
        error,
        refreshUser
    }), [userData, error, refreshUser]);

    // 5) Now you can early‐return children until initial load finishes
    if (loading === null) {
        return null; // or <SplashScreen />
    }

    // 6) Safe to provide context
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (ctx === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return ctx;
};