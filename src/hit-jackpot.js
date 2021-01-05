import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { getBalance } from "./get-balance";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const hitJackpot = async (user, jackpotInfo) => {
    const session = user.session;
    const balance = await getBalance(user);

    if (!balance.isOk) {
        return balance;
    }

    const hitJackpotParams = {
        SiteId: session.siteId,
        GameRoundId: jackpotInfo.gameRoundId,
        GameTypeId: jackpotInfo.gameId,
        WinningAmount: jackpotInfo.winningAmount,
        ObCustId: session.memberId,
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
