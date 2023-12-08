import { init } from "../api-client";
import { placeBetMockFunc } from "sc-api-client";
import { placeBet } from "../place-bet";
import { logger } from "sc-common";

jest.mock("sc-common");
jest.mock("sc-api-client");

describe("notify-login-test", () => {
    beforeAll(() => {
        init({});
    });
    afterEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });
    const user = {
        id: 1,
        session: {
            userId: 1,
            playerId: 1,
            language: "vi-VN",
            owSeq: "123",
            siteId: "site",
            ip: "1.1.1.1",
        },
    };

    const betInfo = {
        amount: 100,
        gameId: 1,
        gameRoundId: 1,
        choiceId: 2,
        freeBet: false,
    };

    it("normal bet - place bet successfully, return correct result", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            minBet: 1,
            maxBet: 5000,
            balance: 1000,
            errorMessage: "",
        };
        placeBetMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await placeBet(user, betInfo);
        expect(result).toEqual({
            isOk: true,
            response: {
                red: expectedResult.balance,
                minBet: expectedResult.minBet,
                maxBet: expectedResult.maxBet,
            },
        });

        expect(logger.composeBeforeCallMessage).toHaveBeenCalled();
    });

    it("free bet - place bet successfully, return correct result", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            minBet: 1,
            maxBet: 5000,
            balance: 1000,
            errorMessage: "",
        };
        placeBetMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await placeBet(user, { ...betInfo, freeBet: true });
        expect(result).toEqual({
            isOk: true,
            response: {
                red: expectedResult.balance,
                minBet: expectedResult.minBet,
                maxBet: expectedResult.maxBet,
            },
        });

        expect(logger.composeBeforeCallMessage).toHaveBeenCalled();
    });

    it("place bet fail, return correct result, log to sentry", async () => {
        const expectedResult = {
            errorCode: 1000,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            balance: 0,
            errorMessage: "error",
            minBet: 0,
            maxBet: 0,
        };

        placeBetMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await placeBet(user, betInfo);

        expect(result).toEqual({
            isOk: false,
            response: {
                apiError: {
                    errorCode: expectedResult.errorCode,
                    gameTypeId: betInfo.gameId,
                    isPlaceBetFailed: true,
                    gameRoundId: betInfo.gameRoundId,
                    minBet: expectedResult.minBet,
                    maxBet: expectedResult.maxBet,
                },
            },
        });
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });

    it("place bet api throw exception, return  result with SB1900 code, log to sentry", async () => {
        const error = new Error("error");
        placeBetMockFunc.mockImplementationOnce(() => {
            throw error;
        });

        const result = await placeBet(user, betInfo);

        expect(result).toEqual({
            isOk: false,
            response: {
                apiError: {
                    errorCode: "SB1900",
                    gameTypeId: betInfo.gameId,
                    isPlaceBetFailed: true,
                    gameRoundId: betInfo.gameRoundId,
                    minBet: undefined,
                    maxBet: undefined,
                },
            },
        });

        expect(logger.logAfterSendToApi).toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledWith(error);
    });
});
