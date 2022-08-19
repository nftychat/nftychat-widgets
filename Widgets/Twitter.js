import { useContext } from "react";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import { Context } from "../../contexts/MainContext";

export default function TwitterIntegration() {
  const { twitterSource } = useContext(Context);

  function handleOnLoad() {
    const twitter = document.querySelector("#twitter-widget-0");

    if (twitter !== undefined) {
      twitter.contentDocument.head.appendChild(style);
    }
  }

  return (
    <aside className="twitter-sidebar">
      <p className="twitter-sidebar__heading"> Community Twitter Feed</p>
      <TwitterTimelineEmbed
        key={twitterSource}
        noBorders={true}
        noFooter={true}
        noHeader={true}
        onLoad={handleOnLoad}
        options={{ height: "100%" }}
        sourceType="url"
        theme="dark"
        url={twitterSource}
      />
    </aside>
  );
}

const style = document.createElement("style");
// CSS variables doesn't work in here because iframe
style.textContent = `
      /* Windows scrollbar style */
      /* Firefox */
      * {
        scrollbar-color: #0f0f0f transparent;
        scrollbar-width: thin;
      }

      /* Chrome */
      *::-webkit-scrollbar {
        width: 8px;
      }

      *::-webkit-scrollbar-thumb {
        background-color: #131313;
        border-radius: 4px;
      }

      a,
      a:hover,
      a:active { color: #94eede !important }
      .SandboxRoot { color: #9d9d9d }
      .timeline-Widget {
        background-color: #19191a;
        border-radius: 0
      }
      .TweetAuthor-name { font-size: 13px !important }
      .timeline-Tweet-text { font-size: 13px !important }
      .timeline-Tweet:hover { background-color: #1e1e20 }
      .TwitterCard-container[data-theme=dark] { border-color: #323239 }
      .TweetAuthor-name { color: #dedede }
      .timeline-Header-title { color: #dedede }
      .TweetAuthor-screenName,
      .timeline-Tweet-timestamp { color: #9d9d9d !important }
      .timeline-Body {
        border-bottom: none;
        border-top: none;
      }
      .timeline-TweetList-tweet { border-top: none }
      .timeline-ShowMoreButton {
        background-color: transparent;
        border-color: #94eede;
        color: #94eede;
      }
      .timeline-ShowMoreButton:hover,
      .timeline-ShowMoreButton:active,
      .timeline-ShowMoreButton:focus {
        background-color: #212121;
        border-color: #94eede;
        color: #94eede;
      }
    `;
