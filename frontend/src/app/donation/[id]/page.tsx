import DonationPageClient from "./DonationPageClient";
import { getProject } from "@/services/projectService";

// @ts-expect-error Next.js PageProps mismatch
export default async function DonationPage({ params, searchParams: _searchParams }) {
  void _searchParams;
  const project = await getProject(params.id);
  return <DonationPageClient project={project} />;
}
