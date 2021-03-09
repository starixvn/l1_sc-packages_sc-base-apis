import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const getBetLimit = async (user) => {
    const session = user.session;

    const getBetLimitParams = {
        ObCustId: session.memberId,
        SiteId: session.siteId,
    };
    const beforeMessage = logger.composeBeforeCallMessage(session, getBetLimitParams);
    const response = await APIClient.getBetLimit(getBetLimitParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    const { minBet, maxBet } = response;
    if (minBet > 0 && maxBet > 0) {
        await userInfos.updateOne({ id: session.userId }, { minBet, maxBet, betLimitModifiedDate: new Date() });
    }

    return apiResult({ isOk: true, response });
};
