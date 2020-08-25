import moment from "moment";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const endGame = async (userId, gameInfo, settleInfo) => {
    if (gameInfo.siteId && gameInfo.memberId > 0) {
        const betAmount = settleInfo.freeBet ? 0 : settleInfo.redPlay;
        const endGameParams = {
            GameRoundId: gameInfo.gameRoundId,
            GameTypeId: gameInfo.gameId,
            ObCustId: gameInfo.memberId,
            SiteId: gameInfo.siteId,
            TotalAmount: betAmount,
            TotalWin: settleInfo.red,
            ValidBetAmount: betAmount,
            EndTime: moment.utc(gameInfo.time),
            FreeBet: settleInfo.freeBet,
        };
        const beforeMessage = logger.composeBeforeCallMessage({ userId }, endGameParams, true);
        const result = await APIClient.endGame(endGameParams, beforeMessage);

        if (isErrorResult(result)) {
            const extraFailedData = {
                gameTypeId: endGameParams.GameTypeId,
                gameRoundId: endGameParams.GameRoundId,
            };

            return getFailedResponse(result, extraFailedData);
        }
    }

    const redAdjustments = { ...settleInfo };

    delete redAdjustments.freeBet;
    await userInfos.updateOne({ id: userId }, { $inc: redAdjustments });

    return apiResult({ isOk: true });
};
