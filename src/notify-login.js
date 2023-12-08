import { logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const notifyLogin = async (user, characterName, firstLogin) => {
    const session = user.session;
    const notifyLoginParams = {
        CharacterName: characterName,
        Seq: session.owSeq,
        SiteId: session.siteId,
        FirstLogin: firstLogin,
        Language: session.language,

        OperatorId: session.operatorId,
        PlayerId: session.playerId,
    };
    const beforeMessage = logger.composeBeforeCallMessage(session, notifyLoginParams);
    const response = await APIClient.notifyLogin(notifyLoginParams, beforeMessage);

    if (isErrorResult(response)) {
        return getFailedResponse(response);
    }

    return apiResult({ isOk: true, response });
};
