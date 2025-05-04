'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
	id: number;
	x: number;
	y: number;
	size: number;
	opacity: number;
}

export default function AnimatedBackground() {
	const [particles, setParticles] = useState<Particle[]>([]);

	useEffect(() => {
		const generatedParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 6 + 2,
			opacity: Math.random() * 0.5 + 0.1,
		}));

		setParticles(generatedParticles);
	}, []);

	return (
		<div className="fixed inset-0 z-0 overflow-hidden">
			<div className="absolute inset-0 bg-[url('/images/crypto-pattern.png')] bg-repeat opacity-5" />

			{particles.map((particle) => (
				<motion.div
					key={particle.id}
					className="absolute rounded-full bg-cyan-500"
					style={{
						left: `${particle.x}%`,
						top: `${particle.y}%`,
						width: `${particle.size}px`,
						height: `${particle.size}px`,
						opacity: particle.opacity,
					}}
					animate={{
						x: [0, Math.random() * 100 - 50, 0],
						y: [0, Math.random() * 100 - 50, 0],
					}}
					transition={{
						duration: Math.random() * 20 + 20,
						repeat: Infinity,
						ease: "easeInOut"
					}}
				/>
			))}

			<div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent" />
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
		</div>
	);
}
