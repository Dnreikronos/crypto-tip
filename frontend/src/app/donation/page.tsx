import { getProject } from '@/services/projectService';
import DonationPageClient from './DonationPageClient';

export default async function DonationPage({
	searchParams,
}: {
	searchParams: { projectId?: string };
}) {
	const project = searchParams.projectId ? await getProject(searchParams.projectId) : null;
	return <DonationPageClient project={project} />;
}
