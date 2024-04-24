const mode = process.env.NODE_ENV;
const dev = mode === 'development';

module.exports = {
	plugins: [require('tailwindcss'), !dev && require('autoprefixer'), !dev && require('cssnano')]
};
