const _apiKey = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiKey", "model"], (data) => {
      if (!data.apiKey) {
        alert("Please set your Gemini API key in the extension options.");
      }
      resolve({ apiKey: data.apiKey, model: data.model });
    });
  });
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.type) {
    // listen to the event
    case "generate-comment":
      await processGenerateCommentRequest(request);
      break;
    default:
      console.log("unknown request type", request.type);
  }
  sendResponse(true);
});

async function processGenerateCommentRequest(request) {
  const config = {
    text: request.text,
    commentType: request.buttonType,
    commentLength: request.commentLength,
  };

  let response = {
    type: "generate-comment-response",
    error: "something went wrong",
  };
  const { apiKey, model } = await _apiKey();
  if (!apiKey) {
    response = {
      type: "generate-comment-response",
      error: "No API key",
    };
  } else {
    try {
      // Add gemini calling here
      const geminiApiUrl =
        `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=` +
        apiKey;
      const geminiRequest = {
        contents: [
          {
            parts: [
              {
                text: `You are a writing assistant crafting replies to LinkedIn posts. Your goal is to make the response feel natural and engaging, as if written by a real person. Match the tone and language of the original post, avoid sounding robotic, and contribute meaningfully to the conversation. Do not use hashtags or emojis. Avoid excessive repetition of words from the post, but keep your response relevant. If the post is from an individual, you may mention their name naturally. If it's from a company or a group, do not include the name. Generate a ${config.commentType} comment of ${config.commentLength} length based on the following text: ${config.text}`,
              },
            ],
          },
        ],
      };

      const geminiResponse = await fetch(geminiApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiRequest),
      });

      if (!geminiResponse.ok) {
        let error = "Gemini API request failed";
        try {
          const errorData = await geminiResponse.json();
          error = `Gemini API error: ${geminiResponse.status} - ${errorData.error.message}`;
        } catch (jsonError) {
          // Handle JSON parsing errors
          console.error("Error parsing Gemini API error response:", jsonError);
        }
        throw new Error(error);
      }

      const geminiData = await geminiResponse.json();
      const comment = geminiData.candidates[0].content.parts[0].text;

      response = {
        type: "generate-comment-response",
        parentForm: request.parentForm,
        comment: comment,
      };
    } catch (error) {
      response = {
        type: "generate-comment-response",
        error: error.message,
      };
    }
  }

  // send the event with response
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, response, function (response) {});
    }
  );
}
