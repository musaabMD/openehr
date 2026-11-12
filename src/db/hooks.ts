import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { Patient, User } from "./types";
import { USERS } from "./seed";

export function usePatientMap(): Map<string, Patient> {
  const list = useLiveQuery(() => db.patients.toArray(), []) ?? [];
  return new Map(list.map((p) => [p.id, p]));
}
export const USER_MAP: Map<string, User> = new Map(USERS.map((u) => [u.id, u]));
export function userName(id?: string): string {
  if (!id) return "—";
  const u = USER_MAP.get(id);
  return u ? `${u.name}${u.credentials ? ", " + u.credentials : ""}` : id;
}
export function userShort(id?: string): string {
  if (!id) return "—";
  const u = USER_MAP.get(id);
  if (!u) return id;
  const parts = u.name.split(" ");
  return `${parts[parts.length - 1]}, ${parts[0]![0]}`;
}
export function usePatient(id?: string) {
  return useLiveQuery(() => (id ? db.patients.get(id) : undefined), [id]);
}
export function useActiveEncounter(patientId?: string) {
  return useLiveQuery(async () => {
    if (!patientId) return undefined;
    const encs = await db.encounters.where("patientId").equals(patientId).toArray();
    return encs.filter((e) => e.status !== "discharged" && e.status !== "canceled").sort((a, b) => b.start.localeCompare(a.start))[0];
  }, [patientId]);
}
export function useLatestVitals(patientId?: string) {
  return useLiveQuery(async () => {
    if (!patientId) return undefined;
    const v = await db.vitals.where("patientId").equals(patientId).toArray();
    return v.sort((a, b) => b.time.localeCompare(a.time))[0];
  }, [patientId]);
}
