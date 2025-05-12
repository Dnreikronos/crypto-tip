import DonationPageClient from './DonationPageClient';
import { getProject } from '@/services/projectService';

interface DonationPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DonationPage({ searchParams }: DonationPageProps) {
	const projectId = searchParams.projectId as string;
	let project = null;

	if (projectId) {
		try {
			project = await getProject(projectId);
		} catch (error) {
			console.error('Error fetching project:', error);
			// Project will remain null if there's an error
		}
	}

	return <DonationPageClient project={project} />;
}
