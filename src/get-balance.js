import { userInfos } from 'sc-base-database';
import { logger } from 'sc-common';
import * as apiClient from './api-client.js';
import { apiResult, getFailedResponse, isErrorResult, isSSOAccount } from './helpers.js';

const setUserRed = (userId, red) => {
    userInfos.updateOne({ id: userId }, { $set: { red: red } }).exec();
};

const updateUserBalanceToDatabase = (userId, red) => {
    try {
        if (userId && red >= 0) {
            setUserRed(userId, red);
        }
    } catch (ex) {
        logger.logError(ex);
    }
};

export const getBalance = async (user, isUpdateUserBalance) => {
    let session = user.session;

    if (isSSOAccount(session)) {
        const balanceParams = {
            Seq: session.owSeq,
            SiteId: session.siteId,
            ObCustId: session.memberId,
            Language: session.language,
        };

        const beforeMessage = logger.composeBeforeCallMessage(session, balanceParams);

        const response = await apiClient.getBalance(balanceParams, beforeMessage);

        if (isErrorResult(response)) {
            return getFailedResponse(response);
        }

        if (isUpdateUserBalance) {
            updateUserBalanceToDatabase(session.userId, response.red);
        }

        return apiResult({ isOk: true, responseData: response });
    }

    return apiResult({ isOk: false });
};

export const getCoinBalance = async (user) => {
    var userInfo = await userInfos.findOne({ id: user.id }, 'coins').lean().exec();

    return apiResult({ isOk: true, responseData: { red: userInfo.coins } });
};
