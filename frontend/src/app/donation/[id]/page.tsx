import DonationPageClient from "./DonationPageClient";
import { getProject } from "@/services/projectService";

export default async function DonationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  return <DonationPageClient project={project} />;
}
