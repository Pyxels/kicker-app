import PocketBase from "pocketbase";
import { toast } from "vue-sonner";

export const pb = new PocketBase("http://localhost:8090");

export async function safe<T>(call: () => Promise<T>): Promise<T | undefined> {
  try {
    return await call();
  } catch (err: any) {
    const msg =
      err?.response?.data?.message || err?.message || "Something went wrong";
    toast.error(msg);
    return undefined;
  }
}
