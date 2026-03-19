# runningofthehumans-phaser

Phaser 3 game project built with Gulp + Browserify + Babel.

## Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm

## Install

```bash
npm install
```

## Development

Run the development workflow (build + local server + file watching):

```bash
npx gulp
```

or explicitly:

```bash
npx gulp watch
```

What this does:

- Cleans `dist/`
- Runs ESLint
- Bundles `src/index.js` into `dist/game.min.js`
- Starts BrowserSync at `http://localhost:3000`
- Rebuilds on `src/*.js` changes and reloads the browser

Use `index-dev.html` during local development if you want to load source modules directly.

## Build

Create a production bundle:

```bash
npx gulp build
```

Output:

- `dist/game.min.js`

The main runtime page (`index.html`) loads this built file:

```html
<script src="./dist/game.min.js" type="module"></script>
```

## Other Tasks

Run lint only:

```bash
npx gulp lint
```

Clean build artifacts:

```bash
npx gulp clean
```

## Project Structure

- `src/` game source files (`GameScene.js`, `TitleScene.js`, entry files)
- `assets/` game images/audio and source art files
- `dist/` generated build output
- `index.html` production entry page
- `index-dev.html` development entry page
- `index-iframe.html` iframe wrapper for development preview
- `gulpfile.babel.js` build, lint, and watch tasks
