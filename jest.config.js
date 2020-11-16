module.exports = {
    roots: ["<rootDir>/src"],
    preset: "ts-jest", //"jest-puppeteer"
    // globals: {
    //   URL: "http://localhost:8080"
    // },
    testMatch: ["**/__tests__/**/*.+(ts|tsx)", "**/?(*.)+(spec|test).+(ts|tsx)"],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
    testEnvironment: 'jsdom',
    //verbose: true
};