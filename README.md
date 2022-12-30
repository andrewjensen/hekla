# DEPRECATED

This project is deprecated. I have not kept up with maintenance of Hekla so I believe it is best to archive it.

Using static code analysis for reporting is still immensely useful. Here are some related projects that might be helpful in doing this analysis:

- [jscodeshift](https://github.com/facebook/jscodeshift), a codemod toolkit that can also be used for gathering data
- [tree-sitter](https://tree-sitter.github.io/tree-sitter/), a cross-language parser generator tool
- [AST Explorer](https://astexplorer.net/), for quickly seeing ASTs and prototyping codemods+linter rules
- [react-scanner](https://github.com/moroshko/react-scanner), static code analysis specifically for React components

# hekla

A pluggable static code analysis toolset for understanding large Javascript projects

[![Build Status](https://travis-ci.org/andrewjensen/hekla.svg?branch=master)](https://travis-ci.org/andrewjensen/hekla)

![Hekla Intro Diagram](https://raw.githubusercontent.com/andrewjensen/hekla/master/assets/intro.png)

## Getting Started

The easiest way to start using Hekla is through the [Webpack plugin](packages/hekla-webpack-plugin) and the [CLI tool](packages/hekla-cli). You can also install and use the [core analysis](packages/hekla-core) package directly.

## "Hekla?"

Hekla is named after a [volcano in Iceland](https://en.wikipedia.org/wiki/Hekla)!
