// ClientIndexWrapper.js
import React from 'react';
import { UserProvider } from '../../../components/user_data/UserContext';
import ClientIndex from './ClientIndex';

/**
 * Wraps the ClientIndex component with UserProvider for user context.
 */
export default function ClientIndexWrapper() {
  return (
    <UserProvider>
      <ClientIndex />
    </UserProvider>
  );
}
