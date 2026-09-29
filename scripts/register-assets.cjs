// Lets the seed script import content/*.ts, whose image imports would otherwise fail outside Next.
const { pathToFileURL } = require("node:url");
for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".avif"]) {
  require.extensions[ext] = (mod, filename) => {
    mod.exports = { src: pathToFileURL(filename).href, width: 0, height: 0 };
  };
}
