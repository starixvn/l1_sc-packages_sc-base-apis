module.exports = async () => {
    return {
        rootDir: "./",
        verbose: true,
        testEnvironment: "node",
        transformIgnorePatterns: ["node_modules/(?!(sc-base-database|sc-common|sc-base-apis|sc-api-client)/)"],
        testResultsProcessor: "jest-sonar-reporter",
        setupFilesAfterEnv: ["jest-extended"],
    };
};
