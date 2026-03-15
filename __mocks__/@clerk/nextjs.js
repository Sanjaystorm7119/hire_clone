export const useUser = () => ({
  isLoaded: true,
  user: {
    firstName: "John",
    lastName: "Doe",
    emailAddresses: [{ emailAddress: "john@example.com" }],
  },
});

export const useSession = () => ({
  session: {
    getToken: async () => "test-token",
  },
});

export const ClerkProvider = ({ children }) => children;
