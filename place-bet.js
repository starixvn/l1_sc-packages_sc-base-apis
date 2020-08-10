import { logger } from 'sc-common';
import * as apiClient from './api-client.js';
import { getBalance, getCoinBalance } from './get-balance.js';
import { apiResult, getFailedResponse, isErrorResult, isSSOAccount } from './helpers.js';

let apiSettings;

export const init = (settings) => {
    apiSettings = settings;
};

export const placeBet = async (user, betInfo) => {
    const session = user.session;
    const betAmount = betInfo.cuoc >> 0;

    const result = betInfo.freeBet ? await getCoinBalance(user) : await getBalance(user);

    if (!result.isOk) {
        return result;
    }

    const userBalance = result;

    if (!result || result.response.red < betAmount) {
        return apiResult({ isOk: false, responseData: { inSufficientBalance: true } });
    }

    const placeBetParams = session
        ? {
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
          }
        : {};

    // TODO: Handle for taixiu game type later
    return placeBetWithValidAmount(user, betInfo, placeBetParams, userBalance);
};

const placeBetWithValidAmount = async (user, betInfo, placeBetParams, userInfo) => {
    const session = user.session;

    try {
        if (apiSettings.enabledApi && isSSOAccount(session)) {
            const beforeMessage = '';
            const response = await apiClient.placeBet(placeBetParams, beforeMessage);
            return handlePlaceBetResponse(user, response, placeBetParams);
        } else {
            // Internal Account
            userInfo.red -= betInfo.cuoc;
            userInfo.save();

            return apiResult({ isOk: true, responseData: userInfo });
        }
    } catch (error) {
        logger.logError(error);
        return apiResult({ isOk: false });
    }
};

const handlePlaceBetResponse = (user, response, placeBetParams) => {
    try {
        if (isErrorResult(response)) {
            const extraFailedData = {
                gameTypeId: placeBetParams.GameTypeId,
                isPlaceBetFailed: true,
                gameRoundId: placeBetParams.GameRoundId,
            };

            return getFailedResponse(response, extraFailedData);
        }

        // setUserRed(user.id, placeBetResult.balance);
        return apiResult({
            isOk: true,
            responseData: {
                id: user.id,
                red: response.balance,
            },
        });
    } catch (error) {
        logger.logError(error);
        return apiResult({ isOk: false });
    }
};
