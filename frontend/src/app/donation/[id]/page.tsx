import DonationPageClient from "./DonationPageClient";
import { getProject } from "@/services/projectService";

export default async function DonationPage({
  params,
  searchParams: _searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  void _searchParams;
  const project = await getProject(params.id);
  return <DonationPageClient project={project} />;
}
