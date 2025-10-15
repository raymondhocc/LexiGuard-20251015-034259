const MOCK_TOKEN_KEY = 'lexiguard_mock_auth_token';
export const login = async (username?: string, password?: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  if (username === 'user' && password === 'password') {
    const mockToken = `mock-token-${Date.now()}`;
    try {
      localStorage.setItem(MOCK_TOKEN_KEY, mockToken);
      return true;
    } catch (error) {
      console.error("Failed to set item in localStorage", error);
      return false;
    }
  }
  return false;
};
export const logout = (): void => {
  try {
    localStorage.removeItem(MOCK_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove item from localStorage", error);
  }
};
export const isAuthenticated = (): boolean => {
  try {
    return !!localStorage.getItem(MOCK_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get item from localStorage", error);
    return false;
  }
};