import { init } from "../api-client";
import { getBalanceMockFunc } from "sc-api-client";
import { userInfos } from "sc-base-database";
import { helpers, logger } from "sc-common";
import { getBalance, validateBalance } from "../get-balance";

jest.mock("sc-common");
jest.mock("sc-base-database");
jest.mock("sc-api-client");

init({});

const user = {
    id: 1,
    session: {
        userId: 1,
        memberId: 1,
        language: "vi-VN",
        owSeq: "123",
        siteId: "site",
    },
};

const balanceParams = {
    Seq: user.session.owSeq,
    SiteId: user.session.siteId,
    ObCustId: user.session.memberId,
    Language: user.session.language,
};

const beforeMessage = "before message";
logger.composeBeforeCallMessage.mockReturnValue(beforeMessage);

describe("get balance tests", () => {
    it("get balance successfully, return correct result, update userInfos", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            balance: 1000,
            errorMessage: "",
        };
        getBalanceMockFunc.mockReturnValueOnce({
            result: expectedResult,
        });

        const result = await getBalance(user, true);

        expect(result).toEqual({ isOk: true, response: { red: expectedResult.balance, ...expectedResult } });
        expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
        expect(logger.composeBeforeCallMessage).toHaveBeenCalledWith(user.session, balanceParams);
        expect(userInfos.updateOne).toHaveBeenCalledWith({ id: user.session.userId }, { $set: { red: expectedResult.balance } });
    });

    it("get balance fail, return correct result, not update userInfos, log to sentry", async () => {
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
        expect(userInfos.updateOne).not.toHaveBeenCalled();
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });

    it("get balance api throw exception, return  result with SB1902 code, not update userInfos, log to sentry", async () => {
        const error = new Error("error");
        getBalanceMockFunc.mockImplementationOnce(() => {
            throw error;
        });
        const result = await getBalance(user);

        expect(result.isOk).toBeFalse();
        expect(result.response.apiError.errorCode).toEqual("SB1902");
        expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
        expect(userInfos.updateOne).not.toHaveBeenCalled();
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
        expect(logger.logError).toHaveBeenCalledWith(error);
    });

    it("get balance return 2002 error code, return kickedout, not update userInfos, log to sentry", async () => {
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
        expect(userInfos.updateOne).not.toHaveBeenCalled();
        expect(logger.logAfterSendToApi).toHaveBeenCalled();
    });
});

describe("validate balance tests", () => {
    it("should return scoin for free bet with valid amount", async () => {
        userInfos.findOne.mockImplementationOnce(() => ({
            lean: () => ({
                exec: () => ({ scoins: 100 }),
            }),
        }));
        const result = await validateBalance(user, { freeBet: true, amount: 10 });

        expect(result).toEqual({ isOk: true, response: { red: 100 } });
    });

    it("should return error when free bet amount > scoins", async () => {
        userInfos.findOne.mockImplementationOnce(() => ({
            lean: () => ({
                exec: () => ({ scoins: 100 }),
            }),
        }));
        const result = await validateBalance(user, { freeBet: true, amount: 200 });

        expect(result).toEqual({
            isOk: false,
            response: { errorCode: helpers.noticeHelper.notEnoughScoin, inSufficientBalance: true },
        });
    });

    it("normal bet, call get balance and return the balance result", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            balance: 1000,
            errorMessage: "",
        };
        getBalanceMockFunc.mockReturnValueOnce({
            result: expectedResult,
        });

        const result = await validateBalance(user, { freeBet: false, amount: 100 });

        expect(result).toEqual({ isOk: true, response: { red: expectedResult.balance, ...expectedResult } });
        expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
    });

    it("normal bet, call get balance and return error when bet amount > balance", async () => {
        const expectedResult = {
            errorCode: 0,
            seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
            balance: 1000,
            errorMessage: "",
        };
        getBalanceMockFunc.mockReturnValueOnce({
            result: expectedResult,
        });

        const result = await validateBalance(user, { freeBet: false, amount: 2000 });

        expect(result).toEqual({
            isOk: false,
            response: { errorCode: helpers.noticeHelper.notEnoughMoney, inSufficientBalance: true },
        });
        expect(getBalanceMockFunc).toHaveBeenCalledWith(balanceParams);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
