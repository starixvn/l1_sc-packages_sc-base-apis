import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const placeBet = async (user, betInfo) => {
    const session = user.session;

    const placeBetParams = {
        SiteId: session.siteId,
        GameRoundId: betInfo.gameRoundId,
        GameTypeId: betInfo.gameId,
        ChoiceId: betInfo.choiceId,
        Amount: betInfo.freeBet || betInfo.freeSpin ? 0 : betInfo.amount,
        Currency: session.currencyName,
        Ip: session.ip,
        Language: session.language,
        System: session.system,
        RoundEndTime: betInfo.roundEndTime,
        FreeBet: betInfo.freeBet,
        FreeSpin: betInfo.freeSpin,
        ContributionRate: betInfo.freeSpin ? 0 : betInfo.contributionRate,
        ContributionAmount: betInfo.freeSpin ? 0 : betInfo.contributionAmount,
        Metadata: betInfo.metadata,
        OperatorId: session.operatorId,
        PlayerId: session.playerId,
        OperatorToken: session.operatorToken,
        UserId: session.userId,
    };

    return placeBetWithValidAmount(user, betInfo, placeBetParams);
};

const placeBetWithValidAmount = async (user, betInfo, placeBetParams) => {
    const beforeMessage = logger.composeBeforeCallMessage(user.session, placeBetParams);
    const response = await APIClient.placeBet(placeBetParams, beforeMessage);

    if (isErrorResult(response)) {
        const extraFailedData = {
            gameTypeId: placeBetParams.GameTypeId,
            isPlaceBetFailed: true,
            gameRoundId: placeBetParams.GameRoundId,
            minBet: response.minBet,
            maxBet: response.maxBet,
        };

        return getFailedResponse(response, extraFailedData);
    }

    return apiResult({
        isOk: true,
        response: {
            red: response.balance,
            minBet: response.minBet,
            maxBet: response.maxBet,
        },
    });
};
