import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const babelConfig = {
  babelrc: false,
  presets: [['@babel/preset-env', { targets: 'defaults, IE >= 10, Safari >= 5.1' }]]
}

export default [{
  input: 'src',
  output: [{
    file: 'lib/bundle.min.js',
    format: "es",
    name: 'algoqrcode',
    exports: 'named',
    sourcemap: true,
  }],
  plugins: [commonjs(), resolve(), babel(babelConfig), terser()]
}]



