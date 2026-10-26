# HYPERDART
Package_Info
# Package Lens — Setup and Run Guide

Package Lens is a hyperDart component for viewing npm package details, comparing packages, and discovering alternatives.

## 1. Prerequisites

Install:

- **Node.js 22.12 or newer within the Node.js 22 release line**, including npm.
- **Visual Studio Code**.
- An internet connection to install dependencies and fetch package information.

Verify Node.js and npm in the terminal:

```bash
node --version
npm --version
```

## 2. Open the Project

1. Download and extract the project ZIP.
2. Open VS Code.
3. Select **File → Open Folder**.
4. Open the `package-lens` folder containing `package.json` and `package-lock.json`.
5. Select **Terminal → New Terminal**.

> Run all commands from the folder containing `package.json`, not from the `src` folder.

## 3. Install Dependencies

```bash
npm ci
```

Wait until installation finishes.

## 4. Run the Application

```bash
npm start
```

Open the **localhost URL displayed in the terminal**.

The application runs through the hyperDart development sandbox. Keep the terminal running while using it.

The default input in `searchData.json` is:

```text
npm express
```

No model download, Python environment, or npm API key is required.

## 5. Test Different Queries

Sample inputs are available in `tests/samples.json`.

| Feature | Example Query |
| --- | --- |
| Package details | `npm express` |
| Compare two packages | `compare express and fastify` |
| Compare three packages | `compare express, fastify, koa` |
| Find alternatives | `npm alternatives to moment` |
| Scoped package details | `npm @angular/core` |

To load a sample:

1. Open `tests/samples.json`.
2. Copy **one complete inner array**, including its query and entities.
3. Replace the entire contents of `searchData.json` with that array.
4. Save the file.
5. Reload the browser. If the input does not update, restart the development server.

> Do not copy the outer array containing all samples. The package entities must match the query.

For example, use this input to compare Express and Fastify:

```json
[
  {
    "component": "package-lens",
    "query": "compare express and fastify",
    "entities": [
      {
        "word": "express",
        "sourceID": "express",
        "collectionName": "NPM_PACKAGES",
        "collectionType": "HD_PACKAGES"
      },
      {
        "word": "fastify",
        "sourceID": "fastify",
        "collectionName": "NPM_PACKAGES",
        "collectionType": "HD_PACKAGES"
      }
    ]
  }
]
```

These files supply query inputs. The component fetches package information from npm when it runs.

## 6. Stop and Restart

Press **Ctrl + C** in the terminal to stop the application.

To run it again:

```bash
npm start
```

You only need to reinstall dependencies if they change or the `node_modules` folder is removed.

## 7. Optional: Tests and Build

Run the included tests:

```bash
npm test
```

Generate the component build:

```bash
npm run build
```

These commands are not required every time you start the application. Publishing is not required for local use.

## Troubleshooting

| Problem | Solution |
| --- | --- |
| `node` or `npm` is not recognized | Install Node.js and restart VS Code. |
| PowerShell blocks `npm.ps1` | Use the Command Prompt terminal or run `npm.cmd ci` and `npm.cmd start`. |
| `package.json` is not found | Run commands inside the `package-lens` folder containing that file. |
| `Missing script: dev` | Use `npm start` instead of `npm run dev`. |
| Dependency engine warning | Check your Node.js version against the prerequisites. |
| No package information appears | Check your internet connection, browser Console/Network errors, and the entities in `searchData.json`. |
| The default port is occupied | Open the actual URL printed by the development server. |

> No VS Code extension is required to run this project. Start it with `npm start`, not Live Server.
