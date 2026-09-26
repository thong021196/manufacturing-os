import { guideRoute } from "@/lib/content/guide-route";

/**
 * Content-calendar pages under /robot-parts (the URL scheme of the
 * search-intent pilot, docs/ops/content-pipeline.md). Pages are defined in
 * lib/content/repository/guides/ -- this file never changes when one is
 * added. Hand-built routes elsewhere in app/ are unaffected.
 *
 * - revalidate = 300: scheduled pages go live (and paused ones disappear)
 *   within ~5 minutes, no redeploy (lib/content/publishing.ts).
 * - dynamicParams stays true (the default) on purpose: with `false`, Next 16
 *   answers a path whose ISR entry was invalidated on demand (the admin's
 *   pause/resume calls revalidatePath) with an internal NoFallbackError ->
 *   permanent 404, and logs an error for every unknown URL. Instead,
 *   proxy.ts rejects any /robot-parts path that is not a registry guide
 *   path before it reaches rendering, so arbitrary URLs never create cache
 *   entries.
 */
export const revalidate = 300;

const route = guideRoute("/robot-parts");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.GuidePage;
