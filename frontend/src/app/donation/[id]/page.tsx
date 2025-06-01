import DonationPageClient from "./DonationPageClient";
import { getProject } from "@/services/projectService";

export default async function DonationPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  return <DonationPageClient project={project} />;
}
