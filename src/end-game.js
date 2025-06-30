import moment from "moment";
import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const endGame = async (userId, gameInfo, settleInfo, metaData) => {
    if (gameInfo.siteId && gameInfo.playerId) {
        const betAmount = settleInfo.redPlay;
        const validBetAmount = settleInfo.validBetAmount;

        const endGameParams = {
            GameRoundId: gameInfo.gameRoundId,
            GameTypeId: gameInfo.gameId,
            SiteId: gameInfo.siteId,
            TotalAmount: betAmount,
            TotalWin: settleInfo.red,
            ValidBetAmount: validBetAmount ?? betAmount,
            EndTime: moment.utc(gameInfo.time),
            FreeBet: settleInfo.freeBet,

            OperatorId: gameInfo.operatorId,
            PlayerId: gameInfo.playerId,
            PromotionId: settleInfo.promotionId,
            MetaData: metaData
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

    return apiResult({ isOk: true });
};
