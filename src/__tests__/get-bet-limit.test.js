import { init } from "../api-client";
import { getBetLimitMockFunc } from "sc-api-client";
import { logger } from "sc-common";
import { getBetLimit } from "../get-bet-limit";

jest.mock("sc-common");
jest.mock("sc-api-client");

describe("get-bet-limit", () => {
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
        },
    };

    it("get bet limit successfully, return correct result", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            minBet: 1,
            maxBet: 5000,
            errorMessage: "",
        };
        getBetLimitMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await getBetLimit(user);
        expect(result).toEqual({ isOk: true, response: expectedResult });
    });

    it("get bet limit fail, return correct result, log to sentry", async () => {
        const expectedResult = {
            errorCode: 1000,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            minBet: 0,
            maxBet: 0,
            errorMessage: "error",
        };
        getBetLimitMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await getBetLimit(user);

        expect(result).toEqual({
            isOk: false,
            response: {
                apiError: { errorCode: expectedResult.errorCode },
            },
        });
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });

    it("get bet limit api throw exception, return  result with SB1903 code, log to sentry", async () => {
        const error = new Error("error");
        getBetLimitMockFunc.mockImplementationOnce(() => {
            throw error;
        });
        const result = await getBetLimit(user);

        expect(result.isOk).toBeFalse();
        expect(result.response.apiError.errorCode).toEqual("SB1903");
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledWith(error);
    });
});
