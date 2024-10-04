"use client";

import { FC, useEffect, useRef, useState } from "react";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import { User, Message, Conversation } from "@/app/types_db";
import MessageItem from "./Message";

interface InboxProps {
    className: string;
    recipient: string; // UUID of the recipient
    loggedInUserId: string; // UUID of the logged-in user
}

const Inbox: FC<InboxProps> = ({ className = "", recipient, loggedInUserId }) => {
    const supabase = createFrontEndClient();

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState<string>("");

    const [senderName, setSenderName] = useState<string>("");
    const [recipientName, setRecipientName] = useState<string>("");

    const messagesContainerRef = useRef<HTMLDivElement>(null); // Create a ref for messages container

    useEffect(() => {
        const fetchConversation = async () => {
            const { data: conversations, error } = await supabase
                .from("conversation")
                .select("*")
                .or(`user_one.eq.${loggedInUserId},user_two.eq.${loggedInUserId}`)
                .or(`user_one.eq.${recipient},user_two.eq.${recipient}`)
                .maybeSingle();

            if (error) {
                console.error("Error fetching conversation:", error);
            } else if (conversations) {
                setConversation(conversations);
                fetchMessages(conversations.id);
            }
        };

        const fetchMessages = async (conversationId: string) => {
            const { data: messages, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                setMessages(messages);
            }
        };

        const fetchSenderName = async () => {
            const { data, error } = await supabase
                .from("user")
                .select("name")
                .eq("uuid", loggedInUserId)
                .single();
            if (error) {
                console.error("Error fetching sender's name:", error);
            } else {
                setSenderName(data?.name || "You");
            }
        };

        const fetchRecipientName = async () => {
            const { data, error } = await supabase
                .from("user")
                .select("name")
                .eq("uuid", recipient)
                .single();
            if (error) {
                console.error("Error fetching recipient's name:", error);
            } else {
                setRecipientName(data?.name || "You");
            }
        };

        fetchSenderName();
        fetchRecipientName();
        fetchConversation();

        // Set up real-time subscription for messages
        const messageSubscription = supabase
            .channel("public:messages")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    const msgContent: Message = payload.new as Message;

                    // Check if the conversation_id matches
                    if (msgContent.conversation_id === conversation?.id) {
                        setMessages((prevMessages) => [...prevMessages, msgContent]);
                    }
                }
            )
            .subscribe();

        return () => {
            // Cleanup subscription on unmount
            supabase.removeChannel(messageSubscription);
        };
    }, [recipient, loggedInUserId, conversation?.id]);

    // Scroll the messages container to the bottom
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        let conversationId = conversation?.id;
        if (!conversationId) {
            const { data: newConversation, error } = await supabase
                .from("conversation")
                .insert({
                    user_one: loggedInUserId,
                    user_two: recipient,
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating conversation:", error);
                return;
            }

            conversationId = newConversation.id;
            setConversation(newConversation);
        }

        const { error: messageError } = await supabase.from("messages").insert({
            sender_id: loggedInUserId,
            conversation_id: conversationId,
            content: newMessage,
        });

        if (messageError) {
            console.error("Error sending message:", messageError);
        } else {
            setNewMessage(""); // Clear input
            const { data: updatedMessages, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching updated messages:", error);
            }
        }
    };

    return (
        <div className={`card rounded-sm bg-base-100 shadow-xl mb-10 p-2 min-h-[400px] flex flex-col ${className}`}>
            <div className="text-lg font-semibold mb-5">Inbox</div>
            <div
                className="messages-container h-[100%] overflow-y-scroll custom-scrollbar"
                ref={messagesContainerRef} // Attach ref to the messages container
            >
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            loggedInUserId={loggedInUserId}
                            senderName={senderName}
                            recipientName={recipientName}
                        />
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>
            <div className="flex-1 flex w-full items-end">
                <div className="w-full message-input-container mt-5 flex flex-row border-[1px] rounded-l-sm border-neutral-500">
                    <input
                        type="text"
                        className="flex-[6] input w-full"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button
                        className="btn btn-primary rounded-none "
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
