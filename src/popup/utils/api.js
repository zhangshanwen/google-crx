import {Auth} from "aws-amplify";

export default {
    platforms: ["googleplay", "appconnect"],
    API_NAME: "MeeRestApi",
    request: async body => {
        if (body)
            return {
                headers: {
                    Authorization: `Bearer ${(await Auth.currentSession())
                        .getIdToken()
                        .getJwtToken()}`
                },
                body: body
            };
        else
            return {
                headers: {
                    Authorization: `Bearer ${(await Auth.currentSession())
                        .getIdToken()
                        .getJwtToken()}`
                }
            };
    },
    PRODUCT: `/app/apps`,
    KEYWORD_STATS: (packageName, wordType) => `/keyword/${packageName}/${wordType}/stats`,
    KEYWORD_CHECK: (packageName, wordType) => `/keyword/${packageName}/${wordType}/check`,
    KEYWORD_SIMILARITY: (packageName, local) => `/keyword/${packageName}/${local}/similarity`
};
