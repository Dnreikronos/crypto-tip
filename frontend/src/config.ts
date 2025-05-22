export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";

export const PROTECTED_ROUTES = [
	'/my-projects',
	'/donation',
	'/create-project',
	'/edit-project/:id',
];

// Rotas públicas - redirecionam para o dashboard se estiver logado
export const PUBLIC_ROUTES = [
	'/login',
	'/register',
	'/forgot-password',
	'/reset-password',
];

// Cookie options
export const COOKIE_OPTIONS = {
	path: '/',
	maxAge: 86400, // 24 horas
	secure: process.env.NODE_ENV === 'production',
	httpOnly: true,
};
