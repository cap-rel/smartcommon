import { setDefaultStory } from "../../../../../storybook";

export const Default = setDefaultStory({
    args: {
        relayPath: "feedback/report",
        visible: true,
        appVersion: "1.0.0",
    },
    code: `
        import { FeedbackButton } from "@cap-rel/smartcommon";

        <FeedbackButton
          relayPath="feedback/report"
          appVersion="1.0.0"
        />
    `,
});
