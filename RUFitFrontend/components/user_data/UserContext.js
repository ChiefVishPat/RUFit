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
import { Text } from 'react-native';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');

                if (!token) {
                    setUserData(null);
                    setLoading(false);
                    return;
                }

                const res = await get_user_profile();
                setUserData(res.data);
            } catch (err) {
                console.error(err);
                setUserData(null);
                setError(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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

    const value = useMemo(() => ({
        userData,
        error,
        refreshUser,
        isAuthenticated: !!userData
    }), [userData, error, refreshUser]);

    if (loading && userData === null) {
        return <Text>Loading...</Text>; // Optional: Replace with <SplashScreen />
    }

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
