import clsx from "clsx"
import React, { useMemo, useState } from "react"
import { BiSend } from "react-icons/bi"
import { FaRobot } from "react-icons/fa"
import { IoClose } from "react-icons/io5"
import { toast } from "sonner"
import { useAskAssistantMutation } from "../redux/slices/api/aiApiSlice"

const starterPrompts = [
    "What should I work on first today?",
    "Which tasks are overdue?",
    "How can we finish before the deadline?",
]

const AIAssistant = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hi, I am VeyraFlow AI. Ask me about deadlines, assigned tasks, project priorities, or what to do next.",
        },
    ])
    const [askAssistant, { isLoading }] = useAskAssistantMutation()

    const history = useMemo(
        () =>
            messages
                .filter((item) => item.role !== "system")
                .slice(-6)
                .map((item) => ({ role: item.role, text: item.text })),
        [messages]
    )

    const sendMessage = async (text = message) => {
        const cleanText = text.trim()
        if (!cleanText) return

        const nextMessages = [...messages, { role: "user", text: cleanText }]
        setMessages(nextMessages)
        setMessage("")

        try {
            const result = await askAssistant({
                message: cleanText,
                history,
            }).unwrap()

            setMessages([
                ...nextMessages,
                {
                    role: "assistant",
                    text: result.answer,
                },
            ])
        } catch (err) {
            toast.error(err?.data?.message || err.message)
            setMessages([
                ...nextMessages,
                {
                    role: "assistant",
                    text:
                        err?.data?.message ||
                        "I could not reach Gemini right now. Check the API key and try again.",
                },
            ])
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-700 text-white shadow-2xl shadow-blue-700/30 flex items-center justify-center hover:bg-blue-800"
                aria-label="Open VeyraFlow AI"
            >
                <FaRobot className="text-2xl" />
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-700 via-slate-900 to-teal-700 text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                                <FaRobot />
                            </div>
                            <div>
                                <p className="font-bold">VeyraFlow AI</p>
                                <p className="text-xs text-white/75">
                                    Low-token deadline and project helper
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-white/80 hover:text-white"
                            aria-label="Close VeyraFlow AI"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    <div className="h-80 overflow-y-auto bg-slate-50 px-4 py-4 space-y-3">
                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={clsx(
                                    "flex",
                                    item.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-6",
                                        item.role === "user"
                                            ? "bg-blue-700 text-white"
                                            : "bg-white text-slate-800 border border-slate-200"
                                    )}
                                >
                                    {item.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-sm text-gray-500">
                                VeyraFlow AI is checking your workspace...
                            </div>
                        )}
                    </div>

                    <div className="px-4 pt-3 flex flex-wrap gap-2">
                        {starterPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                disabled={isLoading}
                                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 flex gap-2">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage()
                            }}
                            placeholder="Ask about tasks, projects, or deadlines..."
                            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="button"
                            onClick={() => sendMessage()}
                            disabled={isLoading}
                            className="rounded-xl bg-blue-700 px-4 text-white disabled:opacity-60"
                            aria-label="Send message"
                        >
                            <BiSend className="text-xl" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIAssistant
