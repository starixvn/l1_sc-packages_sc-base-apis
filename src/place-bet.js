import { userInfos } from "sc-base-database";

import * as APIClient from "./api-client";
import { getBalance, getCoinBalance } from "./get-balance";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const placeBet = async (user, betInfo) => {
    const session = user.session;
    const betAmount = betInfo.amount;
    const balance = betInfo.freeBet ? await getCoinBalance(user) : await getBalance(user);

    if (!balance.isOk) {
        return balance;
    }

    if (balance.response.red < betAmount) {
        return apiResult({ isOk: false, response: { inSufficientBalance: true } });
    }

    const placeBetParams = {
        SiteId: session.siteId,
        GameRoundId: betInfo.gameRoundId,
        GameTypeId: betInfo.gameId,
        ChoiceId: betInfo.choiceId,
        Amount: betInfo.freeBet ? 0 : betAmount,
        Currency: session.currency,
        ObCustId: session.memberId,
        Ip: session.ip,
        Language: session.language,
        RoundEndTime: betInfo.roundEndTime,
        FreeBet: betInfo.freeBet,
    };

    // TODO: Handle for taixiu game type later
    return placeBetWithValidAmount(user, betInfo, placeBetParams);
};

const placeBetWithValidAmount = async (user, betInfo, placeBetParams) => {
    const response = await APIClient.placeBet(placeBetParams);

    if (isErrorResult(response)) {
        const extraFailedData = {
            gameTypeId: placeBetParams.GameTypeId,
            isPlaceBetFailed: true,
            gameRoundId: placeBetParams.GameRoundId,
        };

        return getFailedResponse(response, extraFailedData);
    }

    if (betInfo.freeBet) {
        userInfos.updateOne({ id: user.id }, { $inc: { coins: -betInfo.amount } });
    }

    userInfos.updateOne({ id: user.id }, { $set: { red: response.balance } });

    return apiResult({
        isOk: true,
        response: {
            id: user.id,
            red: response.balance,
            coins: betInfo.freeBet ? (await getCoinBalance(user)).response.red : 0,
        },
    });
};
