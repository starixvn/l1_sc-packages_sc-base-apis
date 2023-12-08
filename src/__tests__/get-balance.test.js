import { init } from "../api-client";
import { getBalanceMockFunc } from "sc-api-client";
import { logger } from "sc-common";
import { getBalance } from "../get-balance";

jest.mock("sc-common");
jest.mock("sc-api-client");

describe("get-balance", () => {
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

    const balanceParams = {
        Seq: user.session.owSeq,
        SiteId: user.session.siteId,
        Language: user.session.language,

        PlayerId: user.session.playerId,
    };

    const beforeMessage = "before message";
    logger.composeBeforeCallMessage.mockReturnValue(beforeMessage);

    describe("get balance tests", () => {
        afterEach(() => {
            jest.resetAllMocks();
        });
        it("get balance successfully, return correct result", async () => {
            const expectedResult = {
                errorCode: 0,
                seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
                balance: 1000,
                errorMessage: "",
            };
            getBalanceMockFunc.mockReturnValueOnce({
                result: expectedResult,
            });

            const result = await getBalance(user);

            expect(result).toEqual({ isOk: true, response: { red: expectedResult.balance, ...expectedResult } });
            expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
            expect(logger.composeBeforeCallMessage).toHaveBeenCalledWith(user.session, balanceParams);
        });

        it("get balance fail, return correct result, log to sentry", async () => {
            const expectedResult = {
                errorCode: 1000,
                seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
                balance: 0,
                errorMessage: "error",
            };
            getBalanceMockFunc.mockReturnValueOnce({ result: expectedResult });

            const result = await getBalance(user);

            expect(result).toEqual({
                isOk: false,
                response: {
                    apiError: {
                        errorCode: expectedResult.errorCode,
                    },
                },
            });
            expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
            expect(logger.logAfterSendToApi).toHaveBeenCalled();
        });

        it("get balance api throw exception, return  result with SB1902 code, log to sentry", async () => {
            const error = new Error("error");
            getBalanceMockFunc.mockImplementationOnce(() => {
                throw error;
            });
            const result = await getBalance(user);

            expect(result.isOk).toBeFalse();
            expect(result.response.apiError.errorCode).toEqual("SB1902");
            expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
            expect(logger.logAfterSendToApi).toHaveBeenCalled();
            expect(logger.logError).toHaveBeenCalledWith(error);
        });

        it("get balance return 2002 error code, return kicked out, log to sentry", async () => {
            const expectedResult = {
                errorCode: 2002,
                seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
                balance: 0,
                errorMessage: "error",
            };
            getBalanceMockFunc.mockReturnValueOnce({ result: expectedResult });

            const result = await getBalance(user);

            expect(result).toEqual({
                isOk: false,
                response: {
                    kickedOut: {
                        errorCode: 2002,
                        isDisabledAccount: true,
                    },
                },
            });
            expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
            expect(logger.logAfterSendToApi).toHaveBeenCalled();
        });
    });
});
