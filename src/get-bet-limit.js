import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const getBetLimit = async (user) => {
    const session = user.session;
    const getBetLimitParams = {
        SiteId: session.siteId,
        OperatorId: session.operatorId,
        PlayerId: session.playerId,
        OperatorToken: session.operatorToken,
    };

    const beforeMessage = logger.composeBeforeCallMessage(session, getBetLimitParams);
    const response = await APIClient.getBetLimit(getBetLimitParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    return apiResult({ isOk: true, response });
};
