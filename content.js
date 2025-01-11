let loading = false;

document.addEventListener("focusin", function (event) {
  if (event.target.classList.contains("ql-editor")) {
    const parentForm = event.target.closest(".comments-comment-texteditor");

    if (parentForm && !parentForm.classList.contains("buttons-appended")) {
      // add appended class to add buttons only on the first event trigger
      parentForm.classList.add("buttons-appended");

      // create and append engage button
      let engageBtn = document.createElement("button");
      engageBtn.classList.add("rounded-button");
      engageBtn.classList.add("first-rounded-button");
      engageBtn.innerText = "🤝 Engage";

      parentForm.appendChild(engageBtn);

      engageBtn.addEventListener("click", function (event) {
        processButtonClicked(event, "engage", parentForm);
      });

      // create and append emotional button
      let questionBtn = document.createElement("button");
      questionBtn.classList.add("rounded-button");
      questionBtn.innerText = "❓Question";
      parentForm.appendChild(questionBtn);

      questionBtn.addEventListener("click", function (event) {
        processButtonClicked(event, "question", parentForm);
      });

      const textBox = document.createElement("input");
      textBox.type = "text";
      textBox.placeholder = "Enter your question";

      const sendButton = document.createElement("button");
      sendButton.innerText = "Send";
      sendButton.classList.add("rounded-button");
      sendButton.addEventListener("click", () => {
        const questionText = textBox.value;
        console.log("Sending question:", questionText);
      });

      const container = document.createElement("div");
      container.style.display = "inline-flex";
      container.appendChild(textBox);
      container.appendChild(sendButton);

      parentForm.appendChild(container);

      const authorSpan = document.createElement("span");
      authorSpan.innerText = " By - khawslee";
      authorSpan.style.fontSize = "0.6em";
      questionBtn.parentNode.insertBefore(authorSpan, questionBtn.nextSibling);
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
    /*border-color: #000000;*/
    border-color: rgba(0, 0, 0, 0.3);
    border-style: solid;
    margin: 10px 3px 10px 3px;
    padding: 5px 10px 5px 10px;
    border-radius: 20px;
}

.first-rounded-button {
    margin-left: 10px;
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
`;
document.head.appendChild(style);
