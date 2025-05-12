import DonationPageClient from './DonationPageClient';
import { getProject } from '@/services/projectService';

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DonationPage({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  const resolvedParams = await searchParams;
  const projectId = resolvedParams.projectId as string;
  const project = projectId ? await getProject(projectId) : null;

  return <DonationPageClient project={project} />;
}
