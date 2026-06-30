function addMessage(text, type) {
    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.classList.add("msg", type);
    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    addMessage("Uploading PDF...", "bot");

    const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    addMessage("PDF processed successfully ✅", "bot");
}

async function askQuestion() {
    const questionInput = document.getElementById("question");
    const question = questionInput.value;

    addMessage(question, "user");

    const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
    });

    const data = await res.json();

    addMessage(data.answer, "bot");

    questionInput.value = "";
}