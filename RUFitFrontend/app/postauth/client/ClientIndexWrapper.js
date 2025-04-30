// ClientIndexWrapper.js
import React from 'react';
import { UserProvider } from '../../../components/user_data/UserContext';
import ClientIndex from './ClientIndex';

export default function ClientIndexWrapper() {
  return (
    <UserProvider>
      <ClientIndex />
    </UserProvider>
  );
}
