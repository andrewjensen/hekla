# hekla-viewer

## Usage

It is easiest to start the viewer through the CLI.

## Development

You will need to set up a proxy server on port 3001 to serve up `hekla.json` to the dev server. A good way to do this is with the `http-server` package:

```bash
npm install -g http-server
cd path/to/your/project
# Start the server. Don't forget to enable CORS!
http-server --cors -p 3001.
```

Then start the dev server:

```bash
npm install
npm start
```
