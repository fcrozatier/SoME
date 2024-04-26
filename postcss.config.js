import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import tailwind from 'tailwindcss';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default {
	plugins: [tailwind(), !dev && autoprefixer(), !dev && cssnano()]
};
