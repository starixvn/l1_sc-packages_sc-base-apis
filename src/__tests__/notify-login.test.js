import { init } from "../api-client";
import { notifyLoginMockFunc } from "sc-api-client";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";
import { notifyLogin } from "../notify-login";

jest.mock("sc-common");
jest.mock("sc-base-database");
jest.mock("sc-api-client");

init({});

const user = {
    session: {
        userId: 1,
        memberId: 1,
        language: "vi-VN",
        owSeq: "123",
        siteId: "site",
    },
};

const characterName = "nv01";
const notifyLoginParams = {
    ObCustId: user.session.memberId,
    CharacterName: characterName,
    Seq: user.session.owSeq,
    SiteId: user.session.siteId,
    FirstLogin: false,
    Language: user.session.language,
};

describe("notify login tests", () => {
    it("notify login successfully, return correct result with user stake level, update userInfos", async () => {
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
        expect(userInfos.updateOne).toHaveBeenCalled();
    });

    it("notify login fail, return correct result, not update userInfos, log to sentry", async () => {
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
        expect(userInfos.updateOne).not.toHaveBeenCalled();
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });

    it("notify login api throw exception, return  result with SB1903 code, not update userInfos, log to sentry", async () => {
        const error = new Error("error");
        notifyLoginMockFunc.mockImplementationOnce(() => {
            throw error;
        });
        const result = await notifyLogin(user, characterName, false);

        expect(result.isOk).toBeFalse();
        expect(result.response.apiError.errorCode).toEqual("SB1903");
        expect(notifyLoginMockFunc).toHaveBeenCalledWith(notifyLoginParams);
        expect(userInfos.updateOne).not.toHaveBeenCalled();
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledWith(error);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
