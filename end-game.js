import moment from 'moment';
import { userInfos } from 'sc-base-database';
import { logger } from 'sc-common';
import * as apiClient from './api-client.js';
import { apiResult, getFailedResponse, isErrorResult } from './helpers.js';

let apiSettings = null;

const init = (settings) => {
    apiSettings = settings;
};

const endGame = async (userId, gameInfo, settleInfo) => {
    // red, redWin, redLost, redPlay
    if (apiSettings.enabledApi && gameInfo.siteId && gameInfo.memberId > 0) {
        const endGameParams = {
            GameRoundId: gameInfo.gameRoundId,
            GameTypeId: gameInfo.gameId,
            ObCustId: gameInfo.memberId,
            SiteId: gameInfo.siteId,
            TotalAmount: settleInfo.freeBet ? 0 : settleInfo.redPlay,
            TotalWin: settleInfo.freeBet ? settleInfo.red - settleInfo.redPlay : settleInfo.red,
            // Currently not support
            ValidBetAmount: settleInfo.freeBet ? 0 : settleInfo.redPlay,
            EndTime: moment.utc(gameInfo.time) || moment.utc(),
            FreeBet: settleInfo.freeBet,
        };

        const beforeMessage = logger.composeBeforeCallMessage(
            { userId: userId },
            endGameParams,
            apiSettings.enabledApiLogs
        );

        const result = await apiClient.endGame(endGameParams, beforeMessage);

        if (isErrorResult(result)) {
            const extraFailedData = { gameTypeId: endGameParams.GameTypeId, gameRoundId: endGameParams.GameRoundId };
            return getFailedResponse(result, extraFailedData);
        } else {
            await userInfos.updateOne({ id: userId }, { $inc: settleInfo });
        }
    } else {
        await userInfos.updateOne({ id: userId }, { $inc: settleInfo }).exec();
    }

    return apiResult({ isOk: true });
};

export { init, endGame };
