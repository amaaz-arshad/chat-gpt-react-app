import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Chat } from "./types";
import { openai } from "./config";
import { ListModelsResponse, Model } from "openai";

export default function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Model[]>();
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const [textRows, setTextRows] = useState(1);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      const modelsList = await openai.listModels();
      setModels(modelsList.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getResponse() {
    try {
      if (!message) return;
      setLoading(true);
      // calling api
      console.log("model:", selectedModel);
      const res = await openai.createChatCompletion({
        model: selectedModel,
        messages: [...chats, { role: "user", content: message }],
        temperature: 0.5,
        max_tokens: 4000
      });
      let updatedChats: Chat[] = [
        ...chats,
        { role: "user", content: message },
        res.data.choices[0].message as Chat
      ];
      console.log(updatedChats);
      setChats(updatedChats);
    } catch (error) {
      console.log((error as any).response.data.error);
    } finally {
      setMessage("");
      setLoading(false);
      setTextRows(1);
    }
  }

  const handleTextareaChange = (event: any) => {
    setMessage(event.target.value);
    event.target.style.height = "auto"; // Reset the height to auto
    event.target.style.height = event.target.scrollHeight + "px"; // Set the height to fit the content
  };

  return (
    <div className="container my-4">
      <div>
        <h1 className="text-center mb-4">ChatGPT 2.0</h1>

        {chats.map((chat, index) => {
          return (
            <div key={index}>
              <div style={{ fontWeight: "bold" }}>
                {chat.role == "user" ? "You" : "AI Bot"}
              </div>
              <div
                className={`alert alert-${
                  chat.role == "user" ? "secondary" : "dark"
                }`}
                role="alert"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {chat.content}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="my-4">
          <div className="mb-3" style={{ width: "33%", float: "right" }}>
            <select
              className="form-select"
              onChange={event => {
                setSelectedModel(event.target.value);
              }}
              value={selectedModel}
            >
              {models &&
                models.map(model => {
                  return (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  );
                })}
            </select>
          </div>

          <textarea
            className="form-control dynamic-textarea"
            placeholder="Send a message"
            value={message}
            onChange={handleTextareaChange}
            rows={textRows}
          />
        </div>

        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-danger me-4"
            type="button"
            onClick={() => setChats([])}
          >
            Clear Chat
          </button>
          <button
            className="btn btn-success"
            type="button"
            onClick={getResponse}
            disabled={loading}
          >
            {loading ? "generating response..." : "send"}
          </button>
        </div>
      </div>
    </div>
  );
}
