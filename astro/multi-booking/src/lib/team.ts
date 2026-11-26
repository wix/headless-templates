// The team, read live from Bookings as a visitor: staffMembers.queryStaffMembers (bio, photo) filtered to the staff assigned to a
// service, so the default "Business Owner" (bound to the account owner's e-mail) is never listed. Each member
// also carries the services they cover, from the services' own staff lists (resource ids).
import { staffMembers } from "@wix/bookings";
import { imgSrc } from "./media";
import type { ServiceDTO } from "./services";

export type Member = { id: string; name: string; bio: string; photo: string; services: string[] };

export async function getTeam(services: ServiceDTO[]): Promise<Member[]> {
  const covers = new Map<string, Set<string>>(); // resource id -> service names
  for (const s of services) for (const m of s.staff) if (m.id) (covers.get(m.id) ?? covers.set(m.id, new Set()).get(m.id)!).add(s.name);
  if (!covers.size) return [];
  try {
    const { items } = await staffMembers.queryStaffMembers().hasSome("resourceId", [...covers.keys()]).find();
    return items
      .map((m: any): Member => ({
        id: m.resourceId, name: m.name ?? "", bio: String(m.description ?? ""), photo: imgSrc(m.mainMedia?.image, 640, 800),
        services: [...(covers.get(m.resourceId) ?? [])].sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  } catch (e) {
    console.error("team read failed", e);
    return [];
  }
}
