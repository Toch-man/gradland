import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run test FILES one at a time, not in parallel. Each file spins up its
    // own MongoMemoryServer instance in beforeAll — running two files at once
    // means two of these trying to start simultaneously, competing for
    // resources (and sometimes the binary download/cache lock), which is
    // exactly what was pushing both past the default hook timeout together.
    fileParallelism: false,

    // Starting a real mongod binary (especially on first run, before it's
    // cached locally) can genuinely take longer than the 10s default.
    hookTimeout: 30000,
  },
});
