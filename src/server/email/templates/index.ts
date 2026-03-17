/**
 * Email template registry.
 *
 * Each template exports a builder function that accepts typed data
 * and returns a raw HTML string with inline styles.
 *
 * To add a new template:
 *   1. Create a file in this directory (e.g. `welcome.ts`)
 *   2. Export a `buildWelcomeHtml(data)` function
 *   3. Re-export it here
 */

export {buildLeadNotificationHtml, buildLeadNotificationSubject} from "./lead-notification";
