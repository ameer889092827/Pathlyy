import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext"; // Import for useLanguage
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"; // Import Card components
import { Bot, User, Loader2 } from "lucide-react"; // Ensure you have these icons available
import { Input } from "@/components/ui/input"; // Import Input component
import { Button } from "@/components/ui/button"; // Import Button component

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        language === "ru"
          ? "Привет! Я ваш ИИ-консультант по выбору специальности. Расскажите мне о своих интересах..."
          : "Hi! I'm your AI career counselor. Tell me about your interests...",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, language }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            language === "ru"
              ? "Извините, произошла ошибка. Попробуйте еще раз."
              : "Sorry, there was an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          {language === "ru"
            ? "ИИ-консультант по специальностям"
            : "AI Career Counselor"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 relative">
        <div
          id="message-container"
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: "500px" }}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user" ? "bg-blue-500" : "bg-purple-500"}`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t bg-white absolute bottom-0 left-0 right-0">
          {" "}
          {/* Positioning the input area */}
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === "ru"
                  ? "Расскажите о своих интересах..."
                  : "Tell me about your interests..."
              }
              disabled={isLoading}
              className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 transition"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
