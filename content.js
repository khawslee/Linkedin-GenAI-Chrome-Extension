let loading = false;
let commentLength = "shorter";

document.addEventListener("focusin", function (event) {
  if (event.target.classList.contains("ql-editor")) {
    const parentForm = event.target.closest(".comments-comment-texteditor");

    if (parentForm && !parentForm.classList.contains("buttons-appended")) {
      // add appended class to add buttons only on the first event trigger
      parentForm.classList.add("buttons-appended");

      const buttons = {
        Engage: { emoji: "🤝", text: "Engage" },
        Question: { emoji: "❓", text: "Question" },
        Humorous: { emoji: "😂", text: "Humorous" },
        Inspirational: { emoji: "🌟", text: "Inspirational" },
        Informative: { emoji: "📚", text: "Informative" },
        Casual: { emoji: "👋", text: "Casual" },
        Witty: { emoji: "🙃", text: "Witty" },
        Enthusiastic: { emoji: "🎉", text: "Enthusiastic" },
        Empathetic: { emoji: "💖", text: "Empathetic" },
        Celebrating: { emoji: "🥳", text: "Celebrating" },
        Answer: { emoji: "✅", text: "Answer" },
        Convincing: { emoji: "💬", text: "Convincing" },
        Teasing: { emoji: "😛", text: "Teasing" },
      };

      const select = document.createElement("select");
      select.classList.add("rounded-select");
      select.classList.add("flex2Div");
      const defaultOption = document.createElement("option");
      defaultOption.text = "Select an option";
      defaultOption.value = "";
      select.appendChild(defaultOption);

      Object.keys(buttons).forEach((key, index) => {
        let option = document.createElement("option");
        option.value = key;
        option.text = `${buttons[key].emoji} ${buttons[key].text}`;
        select.appendChild(option);
      });
      const containerDiv = document.createElement("div");
      containerDiv.classList.add("select-author-container");

      containerDiv.appendChild(select);

      // add comment length options
      const commentLengthDiv = document.createElement("div");
      commentLengthDiv.classList.add("comment-length-div");

      const lengthSelect = document.createElement("select");
      lengthSelect.classList.add("rounded-select");
      const shorterOption = document.createElement("option");
      shorterOption.value = "shorter";
      shorterOption.text = "Shorter";
      const longerOption = document.createElement("option");
      longerOption.value = "longer";
      longerOption.text = "Longer";
      lengthSelect.appendChild(shorterOption);
      lengthSelect.appendChild(longerOption);
      lengthSelect.value = "shorter"; // default to shorter
      commentLengthDiv.appendChild(lengthSelect);
      containerDiv.appendChild(commentLengthDiv);

      lengthSelect.addEventListener("change", function (event) {
        if (event.target.value === "shorter") {
          commentLength = "concise and straight to the point";
        } else {
          commentLength = "detailed and engaging";
        }
      });

      const submitButton = document.createElement("button");
      submitButton.innerText = "Submit";
      submitButton.classList.add("rounded-button");
      containerDiv.appendChild(submitButton);

      submitButton.addEventListener("click", function (event) {
        const selectElement = parentForm.querySelector(".rounded-select");
        const buttonType = selectElement.value;
        processButtonClicked(event, buttonType, parentForm);
      });

      // add author
      const authorSpan = document.createElement("span");
      authorSpan.classList.add("flex1Div");
      authorSpan.innerText = "© khawslee";
      authorSpan.style.fontSize = "0.6em";
      containerDiv.appendChild(authorSpan);

      parentForm.appendChild(containerDiv);
    } else {
      console.log(
        "No parent with the class 'comments-comment-texteditor' found for the focused element."
      );
    }
  }
});

function processButtonClicked(event, buttonType, parentForm) {
  // check if we already loading the response
  if (loading) {
    console.log("already loading");
    return;
  }

  // disable all other buttons to avoid multiple comments creation simultaneously
  document.querySelectorAll(".rounded-button").forEach(function (button) {
    if (button.id !== "expertBtn") {
      button.setAttribute("disabled", true);
      button.classList.add("disabled");
    }
  });

  // add pulse animation to the clicked button
  event.currentTarget.classList.add("loading-animation");

  let text = "";
  const parent = event.currentTarget.closest(".comments-comment-entity");
  if (parent) {
    const span = parent.querySelector(".update-components-text span");
    text = span.innerText;
  } else {
    const mainparent = event.currentTarget.closest(".feed-shared-update-v2");
    if (mainparent) {
      const elements = mainparent.getElementsByClassName(
        "feed-shared-update-v2__description"
      );
      text = elements[0].innerText;
    }
  }

  let textWithoutSeeMore = text
    .replace(/…see more/g, "")
    .replace(/…more/g, "")
    .replace(/hashtag/g, "");

  const lines = textWithoutSeeMore.split("\n");
  const filteredLines = lines.filter((line) => !line.includes("#"));
  textWithoutSeeMore = filteredLines.join("\n");

  // save current state of the app
  loading = true;
  processButton = event.currentTarget;
  processParent = parentForm;

  // send the event
  chrome.runtime.sendMessage({
    type: "generate-comment",
    buttonType: buttonType,
    event: event,
    parentForm: parentForm,
    text: textWithoutSeeMore,
    commentLength: commentLength,
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case "generate-comment-response":
      // stop loading process and enable all buttons
      loading = false;
      processButton.classList.remove("loading-animation");

      document.querySelectorAll(".rounded-button").forEach(function (button) {
        button.removeAttribute("disabled");
        button.classList.remove("disabled");
      });

      if (request.error) {
        console.error(request.error);
        return;
      }

      emulateWriting(processParent, request.comment);

    default:
      console.log("unknown request type", request.type);
  }
  sendResponse(true);
});

function emulateWriting(parentElement, text) {
  let input = parentElement.querySelector(".ql-editor p");
  input.innerText = "";
  let i = 0;
  let interval = setInterval(() => {
    if (i < text.length) {
      input.innerText += text[i];
      i++;
      for (let j = 0; j < 10; j++) {
        if (i < text.length) {
          input.innerText += text[i];
          i++;
        }
      }
    } else {
      clearInterval(interval);
      // we need to remove `ql-blank` style from the section by LinkedIn div processing logic
      input.parentElement.classList.remove("ql-blank");
    }
  }, 20);
}

const style = document.createElement("style");
style.textContent = `
.rounded-button {
    border-width: 1px;
    border-color: rgba(0, 0, 0, 0.7);
    border-style: solid;
    margin: 3px 3px 3px 3px;
    padding: 5px 10px 5px 10px;
    border-radius: 20px;
}

.loading-animation {
    box-shadow: 0 0 0 0 rgb(247, 77, 77);
    transform: scale(1);
    animation: pulse_animation 2s infinite;
}

@keyframes pulse_animation {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgb(247, 77, 77);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
}

.disabled {
    opacity: 0.8;
    pointer-events: none;
}

.comment-length-div {
    display: flex;
    align-items: center;
    width: fit-content;
}

.rounded-select {
    border-width: 1px;
    border-color: rgba(0, 0, 0, 0.7);
    border-style: solid;
    margin: 3px 3px 3px 3px;
    padding: 5px 10px 5px 10px;
    border-radius: 20px;
    padding-right: 40px;
}

.select-author-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 5px;
}

.flex2Div {
    flex: 2; /* Make select wider */
}

.flex1Div {
    flex: 1; /* Make author span take remaining space */
    text-align: left;
}
`;
document.head.appendChild(style);
