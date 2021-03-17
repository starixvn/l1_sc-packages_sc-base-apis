import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const getBalance = async (user, captureBalance) => {
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

    if (captureBalance) {
        await userInfos.updateOne({ id: session.userId }, { $set: { red: response.red } });
    }

    return apiResult({ isOk: true, response });
};

export const getCoinBalance = async (user) => {
    const userInfo = await userInfos.findOne({ id: user.id }, "scoins").lean().exec();

    return apiResult({ isOk: true, response: { red: userInfo.scoins ?? 0 } });
};
