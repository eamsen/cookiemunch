import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import pkg from './package.json';

export default [{
  input: "./src/background.js",
  output: [{
    file: "./bundle/background.bundle.js",
    format: "iife",
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    copy({
      targets: [
        { src: [
          "./src/manifest.json",
          pkg.directories.rules,
        ], dest: "./bundle" },
      ],
    }),
  ],
}, {
  input: "./src/content.js",
  output: [{
    file: "./bundle/content.bundle.js",
    format: "iife",
  }],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
  ]
}];
