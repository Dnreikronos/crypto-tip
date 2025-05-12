import DonationPageClient from './DonationPageClient';
import { getProject } from '@/services/projectService';

interface DonationPageProps {
	params: { [key: string]: string | string[] | undefined };
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DonationPage({ searchParams }: DonationPageProps) {
	const projectId = searchParams.projectId as string;
	const project = projectId ? await getProject(projectId) : null;

	return <DonationPageClient project={project} />;
}

