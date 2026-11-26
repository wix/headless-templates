// The visitor's city: chosen in the header picker, kept in a cookie so the server renders the right services on the first paint.
// Not every service is offered in every city; a service is offered in a city when one of that city's Locations lists it (the
// Locations → services link in the CMS). With no cookie, or an unknown city, the first city in dashboard order is used (San
// Francisco, which offers every service).
import type { AstroGlobal } from "astro";
import { getLocations, getServices, citiesOf, related, type Service } from "./cms";

export const CITY_COOKIE = "city";

const memo: Record<string, { at: number; ids: Set<string> }> = {};
async function serviceIdsIn(city: string, locationIds: string[]): Promise<Set<string>> {
  const hit = memo[city];
  if (hit && Date.now() - hit.at < 30_000) return hit.ids;
  const lists = await Promise.all(locationIds.map((id) => related<Service>("Locations", id, "services")));
  const ids = new Set(lists.flat().map((s) => s._id));
  memo[city] = { at: Date.now(), ids };
  return ids;
}

/** The current city (name), every city, and the services offered there (in dashboard order). */
export async function getCityServices(Astro: AstroGlobal) {
  const [locations, all] = await Promise.all([getLocations(), getServices()]);
  const cities = citiesOf(locations);
  const wanted = Astro.cookies.get(CITY_COOKIE)?.value ?? "";
  const current = cities.find((c) => c.city === wanted) ?? cities[0];
  if (!current) return { city: "", cities, services: all, offered: (_: string) => true };
  const ids = await serviceIdsIn(current.city, current.locations.map((l) => l._id));
  // A failed or empty read never hides the catalogue.
  const services = ids.size ? all.filter((s) => ids.has(s._id)) : all;
  return { city: current.city, cities, services, offered: (id: string) => !ids.size || ids.has(id) };
}

/** Just the city name (header picker, footer tabs). */
export async function getCurrentCity(Astro: AstroGlobal) {
  const cities = citiesOf(await getLocations());
  const wanted = Astro.cookies.get(CITY_COOKIE)?.value ?? "";
  return (cities.find((c) => c.city === wanted) ?? cities[0])?.city ?? "";
}
