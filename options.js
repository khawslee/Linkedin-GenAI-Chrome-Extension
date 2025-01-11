// Saves options to chrome.storage
const saveOptions = () => {
  const apiKey = document.getElementById("apiKey").value;
  const model = document.getElementById("model").value;

  chrome.storage.sync.set({ apiKey: apiKey, model: model }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ apiKey: "", model: "" }, (items) => {
    document.getElementById("apiKey").value = items.apiKey;
    document.getElementById("model").value = items.model;
  });
};

const loadModels = async () => {
  chrome.storage.sync.get({ apiKey: "" }, async (items) => {
    const apiKey = items.apiKey;
    if (!apiKey) {
      console.error(
        "API key not found. Please enter your API key in the options page."
      );
      return;
    }
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const models = data.models;
      const modelSelect = document.getElementById("model");
      modelSelect.innerHTML = ""; // Clear existing options
      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.name;
        option.text = model.displayName;
        modelSelect.appendChild(option);
      });
      chrome.storage.sync.get({ model: "" }, (items) => {
        if (items.model) {
          modelSelect.value = items.model;
        }
      });
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  restoreOptions();
  loadModels();
});
document.getElementById("save").addEventListener("click", saveOptions);
