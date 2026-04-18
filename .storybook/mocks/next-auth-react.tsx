export const signIn = () => {};
export const signOut = () => {};
export const useSession = () => ({
  data: {
    user: {
      name: "Yuri Roberto",
      email: "yuriroberto.design@gmail.com",
      image: null,
    },
    expires: "2026-12-31T00:00:00.000Z",
  },
  status: "authenticated",
});
export const SessionProvider = ({ children }: any) => children;
