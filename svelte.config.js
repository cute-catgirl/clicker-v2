import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			fallback: '404.html'
		}),
		paths: {
			base: 'clicker-v2'
		}
	}
};

export default config;
