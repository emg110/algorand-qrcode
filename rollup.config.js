import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const babelConfig = {
  babelrc: false,
  presets: [['@babel/preset-env', { targets: 'defaults, IE >= 10, Safari >= 5.1' }]]
}

export default [{
  input: 'index.mjs',
  output: [{ file: 'lib/algoqrcode.js', name: 'algoqrcode', exports: 'named' }],
  plugins: [commonjs(), resolve(), babel(babelConfig), terser()]
}]