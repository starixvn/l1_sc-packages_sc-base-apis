import { endGame } from "../end-game";
import { init } from "../api-client";
import { endGameMockFunc } from "sc-api-client";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

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

it("endGame successfully, return correct result, update userInfos", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 0 } });
    const result = await endGame(1, gameInfo, settlementInfo);
    expect(result.isOk).toBeTrue();
    expect(userInfos.updateOne).toHaveBeenCalled();
});

it("endGame fail, return correct result, not update userInfos, log to sentry", async () => {
    endGameMockFunc.mockReturnValueOnce({ result: { errorCode: 1000 } });
    const result = await endGame(1, gameInfo, settlementInfo);

    expect(result.isOk).toBeFalse();
    expect(result.response.apiError.errorCode).toEqual(1000);
    expect(userInfos.updateOne).not.toHaveBeenCalled();
    expect(logger.logAfterSendToApi).toHaveBeenCalled();
});

afterEach(() => {
    jest.resetAllMocks();
});
