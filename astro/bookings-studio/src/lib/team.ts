// The instructors, read live from Bookings as a visitor: staffMembers.queryStaffMembers (bio, photo) filtered to the staff
// assigned to a service, so the default "Business Owner" (bound to the account owner's e-mail) is never listed
//. A class lists its staff through the service (staffMemberDetails, resource ids); a course has none
// there, so its staff come from its calendar events (visitor-readable with fields RESOURCES).
import { staffMembers } from "@wix/bookings";
import { events } from "@wix/calendar";
import { imgSrc } from "./media";
import type { ServiceDTO } from "./services";

export type Member = { id: string; name: string; bio: string; photo: string; classes: string[]; years: number };

// Years of experience: placeholder numbers by position in the list (Bookings has no such field); replace when the real data exists.
const YEARS = [8, 12, 5, 10, 7, 15, 3, 9, 6];

export async function getTeam(services: ServiceDTO[]): Promise<Member[]> {
  const teaches = new Map<string, Set<string>>(); // resource id -> service names
  const add = (rid: string | undefined, name: string) => { if (rid) (teaches.get(rid) ?? teaches.set(rid, new Set()).get(rid)!).add(name); };
  for (const s of services) for (const m of s.staff) add(m.id, s.name);
  await Promise.all(services.filter((s) => s.type === "COURSE" && !s.staff.length && s.scheduleId).map(async (s) => {
    try {
      const res: any = await events.queryEvents({ filter: { scheduleId: s.scheduleId }, sort: [{ fieldName: "start", order: "ASC" }], fields: ["RESOURCES"], cursorPaging: { limit: 1 } } as any);
      for (const r of res.events?.[0]?.resources ?? []) add(r._id, s.name);
    } catch (err) { console.error(err); /* a course without readable events just lists no staff */ }
  }));
  if (!teaches.size) return [];
  try {
    const { items } = await staffMembers.queryStaffMembers().hasSome("resourceId", [...teaches.keys()]).find();
    return items
      .map((m: any): Member => ({ id: m.resourceId, name: m.name ?? "", bio: String(m.description ?? ""), photo: imgSrc(m.mainMedia?.image, 640, 800), classes: [...(teaches.get(m.resourceId) ?? [])].sort((a, b) => a.localeCompare(b, "en", { numeric: true })), years: 0 }))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
      .map((m, i) => ({ ...m, years: YEARS[i % YEARS.length] }));
  } catch (err) { console.error(err);
    return [];
  }
}
