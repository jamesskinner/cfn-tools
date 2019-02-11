const LEVELS = {
  TRACE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
};

const LEVEL_NAMES = Object.entries(LEVELS)
  .reduce((acc, [name, num]) => ({ ...acc, [num]: name }), {});

let logLevel = LEVELS.INFO;

function log(level, ...msgs) {
  if (level < logLevel) return;
  let stream = process.stdout;
  if (level >= LEVELS.ERROR) {
    stream = process.stderr;
    process.exitCode = process.exitCode || 1;
  }
  stream.write(`${[
    `[${ts()} ${LEVEL_NAMES[level]}]`,
    ...msgs,
  ].join(' ')}\n`);
}

export default {
  setLevel(levelName) {
    levelName = levelName.toUpperCase();
    if (!LEVELS[levelName]) {
      throw new Error(`Unknown level ${levelName}`);
    }
    logLevel = LEVELS[levelName];
  },

  log,
  ...Object.keys(LEVELS).reduce((acc, levelName) => {
    acc[levelName.toLowerCase()] = (...msgs) => {
      log(LEVELS[levelName], ...msgs);
    };
    return acc;
  }, {}),
};

function ts() {
  const now = new Date();
  return now.toISOString();
}
