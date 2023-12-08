import { init } from "../api-client";
import { notifyLoginMockFunc } from "sc-api-client";
import { logger } from "sc-common";
import { notifyLogin } from "../notify-login";

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
        session: {
            userId: 1,
            playerId: 1,
            language: "vi-VN",
            owSeq: "123",
            siteId: "site",
        },
    };

    const characterName = "nv01";
    const notifyLoginParams = {
        CharacterName: characterName,
        Seq: user.session.owSeq,
        SiteId: user.session.siteId,
        FirstLogin: false,
        Language: user.session.language,

        OperatorId: undefined,
        PlayerId: user.session.playerId,
    };

    it("notify login successfully, return correct result with user stake level", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            minBet: 1,
            maxBet: 5000,
            errorMessage: "",
        };
        notifyLoginMockFunc.mockReturnValueOnce({
            result: expectedResult,
        });

        const result = await notifyLogin(user, characterName, false);

        expect(result).toEqual({ isOk: true, response: expectedResult });
        expect(notifyLoginMockFunc).toHaveBeenCalledWith(notifyLoginParams);
        expect(logger.composeBeforeCallMessage).toHaveBeenCalledWith(user.session, notifyLoginParams);
    });

    it("notify login fail, return correct result, log to sentry", async () => {
        const expectedResult = {
            errorCode: 1000,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            balance: 0,
            errorMessage: "error",
        };
        notifyLoginMockFunc.mockReturnValueOnce({ result: expectedResult });

        const result = await notifyLogin(user, characterName, false);

        expect(result).toEqual({
            isOk: false,
            response: {
                apiError: {
                    errorCode: expectedResult.errorCode,
                },
            },
        });
        expect(notifyLoginMockFunc).toHaveBeenCalledWith(notifyLoginParams);
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });

    it("notify login api throw exception, return  result with SB1903 code, log to sentry", async () => {
        const error = new Error("error");
        notifyLoginMockFunc.mockImplementationOnce(() => {
            throw error;
        });
        const result = await notifyLogin(user, characterName, false);

        expect(result.isOk).toBeFalse();
        expect(result.response.apiError.errorCode).toEqual("SB1903");
        expect(notifyLoginMockFunc).toHaveBeenCalledWith(notifyLoginParams);
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledWith(error);
    });
});
