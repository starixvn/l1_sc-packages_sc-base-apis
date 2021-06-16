export const endGameMockFunc = jest.fn();
const mock = jest.fn().mockImplementation(() => {
    return {
        member: { endGame: endGameMockFunc },
        autoUpdateToken: jest.fn(),
    };
});

export default mock;
