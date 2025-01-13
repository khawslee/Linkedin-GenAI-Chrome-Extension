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
      };

      Object.keys(buttons).forEach((key, index) => {
        let btn = document.createElement("button");
        btn.classList.add("rounded-button");
        btn.innerText = `${buttons[key].emoji} ${buttons[key].text}`;
        parentForm.appendChild(btn);
        btn.addEventListener("click", function (event) {
          processButtonClicked(event, key, parentForm);
        });
      });

      // add author
      const authorSpan = document.createElement("span");
      authorSpan.innerText = "© khawslee";
      authorSpan.style.fontSize = "0.6em";
      parentForm.appendChild(authorSpan);

      // add comment length options
      const commentLengthDiv = document.createElement("div");
      commentLengthDiv.classList.add("comment-length-div");

      const shorterRadio = document.createElement("input");
      shorterRadio.type = "radio";
      shorterRadio.id = "shorterComment";
      shorterRadio.name = "commentLength";
      shorterRadio.value = "shorter";
      shorterRadio.checked = true; // default to shorter
      shorterRadio.addEventListener("click", function () {
        commentLength = "1 sentence";
      });

      const shorterLabel = document.createElement("label");
      shorterLabel.htmlFor = "shorterComment";
      shorterLabel.innerText = "Shorter";
      shorterLabel.style.marginLeft = "5px";
      shorterLabel.style.marginRight = "10px";

      const longerRadio = document.createElement("input");
      longerRadio.type = "radio";
      longerRadio.id = "longerComment";
      longerRadio.name = "commentLength";
      longerRadio.value = "longer";
      longerRadio.addEventListener("click", function () {
        commentLength = "at least 3 sentences";
      });

      const longerLabel = document.createElement("label");
      longerLabel.htmlFor = "longerComment";
      longerLabel.innerText = "Longer";
      longerLabel.style.marginLeft = "5px";

      commentLengthDiv.appendChild(shorterRadio);
      commentLengthDiv.appendChild(shorterLabel);
      commentLengthDiv.appendChild(longerRadio);
      commentLengthDiv.appendChild(longerLabel);

      parentForm.appendChild(commentLengthDiv);
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
    border-color: rgba(0, 0, 0, 0.3);
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
    padding: 5px;
    margin: -5px 3px 5px 3px;
    display: flex;
    align-items: center;
}
`;
document.head.appendChild(style);
