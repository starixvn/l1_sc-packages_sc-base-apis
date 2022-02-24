import { init } from "../api-client";
import { hitJackpotMockFunc } from "sc-api-client";
import { logger } from "sc-common";
import { hitJackpot } from "../hit-jackpot";

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

const jackpotInfo = {
    gameRoundId: 100,
    gameId: 29,
    winningAmount: 20000,
};

const hitJackpotParams = {
    SiteId: user.session.siteId,
    ObCustId: user.session.memberId,
    GameRoundId: jackpotInfo.gameRoundId,
    GameTypeId: jackpotInfo.gameId,
    WinningAmount: jackpotInfo.winningAmount,
    PartnerId: undefined,

    OperatorId: undefined,
    PlayerId: user.session.memberId,
};

it("hit jackpot successfully, return correct result", async () => {
    const expectedResult = {
        errorCode: 0,
        seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
        obCustId: 1,
        errorMessage: "",
    };

    hitJackpotMockFunc.mockReturnValueOnce({ result: expectedResult });

    const result = await hitJackpot(user, jackpotInfo);
    expect(result).toEqual({ isOk: true });
    expect(logger.composeBeforeCallMessage).toHaveBeenCalledWith(user.session, hitJackpotParams);
});

it("hit jackpot fail, return correct result with SB1904 error code, log to sentry", async () => {
    const expectedResult = {
        errorCode: 1000,
        seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
        minBet: 0,
        maxBet: 0,
        errorMessage: "error",
    };
    hitJackpotMockFunc.mockReturnValueOnce({ result: expectedResult });

    const result = await hitJackpot(user, jackpotInfo);

    expect(result).toEqual({
        isOk: false,
        response: {
            apiError: {
                errorCode: "SB1904",
                gameTypeId: jackpotInfo.gameId,
                gameRoundId: jackpotInfo.gameRoundId,
            },
        },
    });
    expect(logger.logAfterSendToApi).toHaveBeenCalled();
});

it("hit jackpot api throw exception, return  result with SB1903 code, not update userInfos, log to sentry", async () => {
    const error = new Error("error");
    hitJackpotMockFunc.mockImplementationOnce(() => {
        throw error;
    });

    const result = await hitJackpot(user, jackpotInfo);

    expect(result).toEqual({
        isOk: false,
        response: {
            apiError: {
                errorCode: "SB1904",
                gameTypeId: jackpotInfo.gameId,
                gameRoundId: jackpotInfo.gameRoundId,
            },
        },
    });
    expect(logger.logAfterSendToApi).toHaveBeenCalled();
    expect(logger.logCritical).toHaveBeenCalledWith(error);
});

afterEach(() => {
    jest.resetAllMocks();
});
