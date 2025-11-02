import 'better-auth';

declare module 'better-auth' {
  interface User {
    teamId?: string | null;
    role?: string | null;
  }
}
