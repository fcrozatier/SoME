import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

export default {
	plugins: [tailwind(), !dev && autoprefixer(), !dev && cssnano()]
};
