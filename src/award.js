import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const award = async (user, awardInfo) => {
    const awardParams = {
        PlayerId: awardInfo.playerId,
        SiteId: awardInfo.siteId,
        Amount: awardInfo.amount,
        Currency: awardInfo.currency,
        GameTypeId: awardInfo.gameId,
        OperatorId: awardInfo.operatorId,
        PromotionId: awardInfo.promotionId,
    };
    const beforeMessage = logger.composeBeforeCallMessage(user.session, awardParams);

    const result = await APIClient.award(awardParams, beforeMessage);

    if (isErrorResult(result)) {
        const extraFailedData = {
            promotionId: awardInfo.promotionId,
            playerId: awardInfo.playerId,
        };

        return getFailedResponse(result, extraFailedData);
    }

    return apiResult({ isOk: true });
};
