export interface Project {
	id: string;
	title: string;
	description: string;
	goal: number;
	raised: number;
	walletAddr: string;
	createdAt: Date;
}

const mockProjects: Project[] = [
	{
		id: "1",
		title: "Decentralized Exchange App",
		description: "A fully decentralized exchange for trading tokens across multiple blockchains",
		goal: 5.0,
		raised: 2.75,
		walletAddr: "0x1234...5678",
		createdAt: new Date('2023-12-10')
	},
	{
		id: "2",
		title: "NFT Marketplace",
		description: "Marketplace for creating, buying and selling unique digital assets",
		goal: 3.0,
		raised: 1.2,
		walletAddr: "0xabcd...efgh",
		createdAt: new Date('2024-01-05')
	},
	{
		id: "3",
		title: "DeFi Lending Protocol",
		description: "Decentralized finance protocol for lending and borrowing crypto assets",
		goal: 10.0,
		raised: 4.5,
		walletAddr: "0x9876...5432",
		createdAt: new Date('2024-02-15')
	}
];

export async function getProjects(): Promise<Project[]> {
	// Simulating API call with a small delay
	await new Promise(resolve => setTimeout(resolve, 10));
	return mockProjects;
}
