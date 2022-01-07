import { endGame } from "../end-game";
import { init } from "../api-client";
import { endGameMockFunc } from "sc-api-client";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";
import moment from "moment";

jest.mock("sc-common");
jest.mock("sc-base-database");
jest.mock("sc-api-client");

init({});

const gameInfo = {
    gameId: 1,
    gameRoundId: 1,
    memberId: 123,
    siteId: "lumi",
    time: new Date(),
};
const settlementInfo = {
    redPlay: 10,
    freeBet: false,
};

const userId = 1;

it("endGame successfully, return correct result, update userInfos", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 0 } });
    const result = await endGame(userId, gameInfo, settlementInfo);
    expect(result.isOk).toBeTrue();
    expect(userInfos.updateOne).toHaveBeenCalledWith({ id: userId }, { $inc: { redPlay: settlementInfo.redPlay } });
});

it("endGame successfully, return correct valid bet amount, update userInfos when valid bet amount is provided", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 0 } });
    const validBetAmount = 5;
    const result = await endGame(userId, gameInfo, { ...settlementInfo, validBetAmount });

    expect(endGameMockFunc).toHaveBeenCalledWith({
        GameRoundId: gameInfo.gameRoundId,
        GameTypeId: gameInfo.gameId,
        ObCustId: gameInfo.memberId,
        SiteId: gameInfo.siteId,
        TotalAmount: settlementInfo.redPlay,
        TotalWin: settlementInfo.red,
        ValidBetAmount: validBetAmount,
        EndTime: moment.utc(gameInfo.time),
        FreeBet: settlementInfo.freeBet,
        PartnerId: gameInfo.partnerId,
    });
    expect(result.isOk).toBeTrue();
    expect(userInfos.updateOne).toHaveBeenCalledWith({ id: userId }, { $inc: { redPlay: settlementInfo.redPlay } });
});

it("endGame successfully, return correct valid bet amount, update userInfos when valid bet amount is NOT provided", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 0 } });
    const validBetAmount = undefined;
    const result = await endGame(userId, gameInfo, { ...settlementInfo, validBetAmount });

    expect(endGameMockFunc).toHaveBeenCalledWith({
        GameRoundId: gameInfo.gameRoundId,
        GameTypeId: gameInfo.gameId,
        ObCustId: gameInfo.memberId,
        SiteId: gameInfo.siteId,
        TotalAmount: settlementInfo.redPlay,
        TotalWin: settlementInfo.red,
        ValidBetAmount: settlementInfo.redPlay,
        EndTime: moment.utc(gameInfo.time),
        FreeBet: settlementInfo.freeBet,
        PartnerId: gameInfo.partnerId,
    });
    expect(result.isOk).toBeTrue();
    expect(userInfos.updateOne).toHaveBeenCalledWith({ id: userId }, { $inc: { redPlay: settlementInfo.redPlay } });
});

it("endGame fail, return correct result, not update userInfos, log to sentry", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 1000 } });
    const result = await endGame(userId, gameInfo, settlementInfo);

    expect(result.isOk).toBeFalse();
    expect(result.response.apiError.errorCode).toEqual(1000);
    expect(result.response.apiError.gameRoundId).toEqual(gameInfo.gameRoundId);
    expect(result.response.apiError.gameTypeId).toEqual(gameInfo.gameId);
    expect(userInfos.updateOne).not.toHaveBeenCalled();
    expect(logger.logAfterSendToApi).toHaveBeenCalled();
});

it("endGame api throw exception, return  result with SB1901 code, not update userInfos, log to sentry", async () => {
    const error = new Error("error");
    endGameMockFunc.mockImplementationOnce(() => {
        throw error;
    });
    const result = await endGame(userId, gameInfo, settlementInfo);

    expect(result.isOk).toBeFalse();
    expect(result.response.apiError.errorCode).toEqual("SB1901");
    expect(result.response.apiError.gameRoundId).toEqual(gameInfo.gameRoundId);
    expect(result.response.apiError.gameTypeId).toEqual(gameInfo.gameId);
    expect(userInfos.updateOne).not.toHaveBeenCalled();
    expect(logger.logAfterSendToApi).toHaveBeenCalled();
    expect(logger.logError).toHaveBeenCalledWith(error);
});

afterEach(() => {
    jest.resetAllMocks();
});
