import { PageHeader } from '@/components/ui/PageHeader';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import ProjectsContent from './ProjectsContent';

export default function MyProjectsPage() {
	return (
		<div className="pt-20 pb-16 w-full bg-black text-white relative min-h-screen">
			<AnimatedBackground />
			<main className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
				<PageHeader title="My Projects" description="View your projects" showCreateButton />
				<ProjectsContent />
			</main>
		</div>
	);
}
