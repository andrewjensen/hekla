# hekla-cli

CLI for running static analysis with Hekla

[![Build Status](https://travis-ci.org/andrewjensen/hekla.svg?branch=master)](https://travis-ci.org/andrewjensen/hekla)

## Usage

### Step 1: Configure your project to use Hekla

You usually want to integrate Hekla with your Webpack configuration, so follow the steps in the [hekla-webpack-plugin](https://www.npmjs.com/package/hekla-webpack-plugin) project.

### Step 2: Install the CLI tool globally

```bash
npm install -g hekla-cli
```

### Step 3: Run the analyzer

```bash
# Start in your project directory
cd /path/to/your/project/

# See usage help
hekla --help

# Analyze the whole project directory recursively
hekla analyze

# Analyze a single file
hekla analyze --single src/your-feature/components/YourComponent.js

# Specify a custom config file location
hekla analyze --config path/to/your/hekla.config.js
```
