export interface AppUser {
  uid: string;
  authMethod: 'phone' | 'email' | 'guest';
  displayName?: string;
  email?: string;
  phone?: string;
  preferredState?: string;
  createdAt: number;
}
