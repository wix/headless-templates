import { createContext, useContext } from 'react';
import { Member } from '..';

// Types for member state
export interface MemberState {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Member actions interface
export interface MemberActions {
  loadCurrentMember: () => Promise<void>;
  login: () => void;
  logout: () => void;
  clearMember: () => void;
}

// Combined context type
export interface MemberContextType extends MemberState {
  actions: MemberActions;
}

// Create the context
export const MemberContext = createContext<MemberContextType | undefined>(undefined);

// Custom hook to use the member context
export const useMember = () => {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
}; 