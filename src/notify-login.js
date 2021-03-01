import { userInfos } from "sc-base-database";
import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const notifyLogin = async (user, characterName, firstLogin) => {
    const session = user.session;
    const notifyLoginParams = {
        ObCustId: session.memberId,
        CharacterName: characterName,
        Seq: session.owSeq,
        SiteId: session.siteId,
        FirstLogin: firstLogin,
        Language: session.language,
    };
    const beforeMessage = logger.composeBeforeCallMessage(session, notifyLoginParams);
    const response = await APIClient.notifyLogin(notifyLoginParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    const { minBet, maxBet } = response;
    if (minBet > 0 && maxBet > 0) {
        await userInfos.updateOne({ id: session.userId }, { minBet, maxBet, betLimitModifiedDate: new Date() });
    }

    return apiResult({ isOk: true, response });
};
