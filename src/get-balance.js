import { userInfos } from "sc-base-database";
import { helpers, logger } from "sc-common";

import * as APIClient from "./api-client";
import { apiResult, getFailedResponse, isErrorResult } from "./helpers";

export const getBalance = async (user, captureBalance) => {
    const session = user.session;
    const balanceParams = {
        Seq: session.owSeq,
        SiteId: session.siteId,
        ObCustId: session.memberId,
        Language: session.language,
        PartnerId: session.partnerId,

        OperatorId: session.partnerId,
        PlayerId: session.memberId,
        OperatorToken: session.OperatorToken,
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

export const validateBalance = async (user, betInfo) => {
    const betAmount = betInfo.amount;
    const balance = betInfo.freeBet ? await getCoinBalance(user) : await getBalance(user);
    const balanceError = betInfo.freeSpin ? null : isValidForBet(balance, betAmount, betInfo.freeBet);

    if (balanceError) {
        return balanceError;
    }

    return balance;
};

const isValidForBet = (balance, betAmount, freeBet) => {
    if (!balance.isOk) {
        return balance;
    }

    if (balance.response.red < betAmount) {
        const errorCode = freeBet ? helpers.noticeHelper.notEnoughScoin : helpers.noticeHelper.notEnoughMoney;

        return apiResult({ isOk: false, response: { inSufficientBalance: true, errorCode } });
    }

    return null;
};
