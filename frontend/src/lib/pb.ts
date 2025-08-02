import PocketBase from 'pocketbase';
import { toast } from 'vue-sonner';

const dev = import.meta.env.DEV;

// in dev, hardcode the backend url
// in prod, dynamically use the deployed origin
export const baseUrl = dev ? 'http://localhost:8090' : window.location.origin;
export const pb = new PocketBase(baseUrl);

export async function safe<T>(call: () => Promise<T>): Promise<T | undefined> {
  try {
    return await call();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Something went wrong';
    toast.error(msg);
    return undefined;
  }
}
