// Home reads that two islands share (the tiles' "Next: Mon 6:00 PM" and the Upcoming strip): ONE class query and ONE course
// query per page load, in the visitor's time zone (a client-only read: availability is zone-specific).
import { fetchClassSessions, loadCourses, type CourseData, type Session } from "./schedule";
import type { ServiceDTO } from "./services";
import { addDays, displayZone, localInZone, todayIn } from "./dates";

export type HomeData = { tz: string; classSessions: Session[]; courses: CourseData[]; nextByClass: Map<string, Session> };
let shared: Promise<HomeData> | null = null;

const ATTEMPT_MS = 10000; // one read that never answers ends in a failure, not an endless skeleton
const RETRY_DELAY_MS = 1500;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function read(classes: ServiceDTO[], courses: ServiceDTO[]): Promise<HomeData> {
  const tz = displayZone();
  const today = todayIn(tz);
  const [classSessions, courseData] = await Promise.all([fetchClassSessions(classes, today, addDays(today, 14), tz), loadCourses(courses, tz)]);
  const nowLocal = localInZone(new Date().toISOString(), tz);
  const nextByClass = new Map<string, Session>();
  for (const s of [...classSessions].sort((a, b) => a.start.localeCompare(b.start))) if (s.start > nowLocal && !nextByClass.has(s.serviceId)) nextByClass.set(s.serviceId, s);
  return { tz, classSessions, courses: courseData, nextByClass };
}

/** One shared read. A FAILED read is never kept: the next caller starts a new one (a cached rejection would make every retry fail). */
export function loadHome(classes: ServiceDTO[], courses: ServiceDTO[]): Promise<HomeData> {
  if (shared) return shared;
  const attempt: Promise<HomeData> = Promise.race([read(classes, courses), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ATTEMPT_MS))]);
  shared = attempt;
  attempt.catch(() => { if (shared === attempt) shared = null; });
  return attempt;
}

/** loadHome with one automatic retry after a short delay. Every Home island uses this, so a blip heals itself. */
export async function loadHomeWithRetry(classes: ServiceDTO[], courses: ServiceDTO[]): Promise<HomeData> {
  try { return await loadHome(classes, courses); } catch (err) { console.error(err); await sleep(RETRY_DELAY_MS); return loadHome(classes, courses); }
}

/** The visitor pressed "Try again" in the Upcoming strip: every Home island reads again. */
export const HOME_RETRY_EVENT = "home:retry";
export function retryHome() { shared = null; try { window.dispatchEvent(new Event(HOME_RETRY_EVENT)); } catch (err) { console.error(err); /* no window */ } }

/** The next `count` sessions from now, classes and course sessions together, soonest first. */
export function upcoming(d: HomeData, count: number): Session[] {
  const nowLocal = localInZone(new Date().toISOString(), d.tz);
  return [...d.classSessions, ...d.courses.filter((c) => c.status !== "ended").flatMap((c) => c.sessions)]
    .filter((s) => s.start > nowLocal)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, count);
}
