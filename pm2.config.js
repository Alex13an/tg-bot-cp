module.exports = {
  name: "tg-bot-cp", // Name of your application
  script: "dist/server.js", // Entry point of your application
  interpreter: "bun", // Bun interpreter
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
  },
};
