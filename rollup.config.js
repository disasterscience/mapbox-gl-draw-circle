import resolve from '@rollup/plugin-node-resolve';

export default {
  input: ['index.js'],
  output: {
    file: 'dist/mapbox-gl-draw-circle.js',
    format: 'es',
    sourcemap: true,
    indent: false
  },
  treeshake: true,
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true
    }),
  ],
};
