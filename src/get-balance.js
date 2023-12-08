import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const getBalance = async (user, captureBalance) => {
    const session = user.session;
    const balanceParams = {
        Seq: session.owSeq,
        SiteId: session.siteId,
        Language: session.language,

        OperatorId: session.operatorId,
        PlayerId: session.playerId,
        OperatorToken: session.operatorToken,
    };

    const beforeMessage = logger.composeBeforeCallMessage(session, balanceParams);
    const response = await APIClient.getBalance(balanceParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    return apiResult({ isOk: true, response });
};
