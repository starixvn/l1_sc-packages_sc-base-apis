import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

import * as APIClient from "./api-client.js";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers.js";

export const getBalance = async (user, isUpdateUserBalance) => {
    const session = user.session;
    const balanceParams = {
        Seq: session.owSeq,
        SiteId: session.siteId,
        ObCustId: session.memberId,
        Language: session.language,
    };
    const beforeMessage = logger.composeBeforeCallMessage(session, balanceParams);
    const response = await APIClient.getBalance(balanceParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    if (isUpdateUserBalance) {
        await userInfos.updateOne({ id: user.id }, { $set: { red: response.red } });
    }

    return apiResult({ isOk: true, response });
};

export const getCoinBalance = async (user) => {
    const userInfo = await userInfos.findOne({ id: user.id }, "coins").lean().exec();

    return apiResult({ isOk: true, response: { red: userInfo.coins } });
};
