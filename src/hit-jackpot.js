import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const hitJackpot = async (user, jackpotInfo) => {
    const session = user.session;
    const hitJackpotParams = {
        SiteId: session.siteId,
        GameRoundId: jackpotInfo.gameRoundId,
        GameTypeId: jackpotInfo.gameId,
        WinningAmount: jackpotInfo.winningAmount,

        OperatorId: session.operatorId,
        PlayerId: session.playerId,
    };

    const beforeMessage = logger.composeBeforeCallMessage(user.session, hitJackpotParams);
    const response = await APIClient.hitJackpot(hitJackpotParams, beforeMessage);

    if (isErrorResult(response)) {
        const extraFailedData = {
            gameTypeId: hitJackpotParams.GameTypeId,
            gameRoundId: hitJackpotParams.GameRoundId,
        };

        return getFailedResponse(response, extraFailedData);
    }

    return apiResult({
        isOk: true,
    });
};
