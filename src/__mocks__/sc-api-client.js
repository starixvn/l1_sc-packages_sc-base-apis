import { placeBet } from "../api-client";

export const endGameMockFunc = jest.fn();
export const getBalanceMockFunc = jest.fn();
export const getBetLimitMockFunc = jest.fn();
export const hitJackpotMockFunc = jest.fn();
export const notifyLoginMockFunc = jest.fn();
export const placeBetMockFunc = jest.fn();

const mock = jest.fn().mockImplementation(() => {
    return {
        member: {
            endGame: endGameMockFunc,
            balance: getBalanceMockFunc,
            getBetLimit: getBetLimitMockFunc,
            hitJackpot: hitJackpotMockFunc,
            notifyLogin: notifyLoginMockFunc,
            placeBet: placeBetMockFunc,
        },
        autoUpdateToken: jest.fn(),
    };
});

export default mock;
