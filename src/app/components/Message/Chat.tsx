"use client";

import { FC, useEffect, useState } from "react";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import Inbox from "@/app/components/Message/Inbox";
import { Conversation, User } from "@/app/types_db";

interface ConversationWithUserNames extends Conversation {
    otherUserName: string;
}

interface ChatProps {
    loggedInUserId: string | null;
    selectedConversationId: string | null;
}
const Chat: FC<ChatProps> = ({ loggedInUserId, selectedConversationId = null }) => {
    const supabase = createFrontEndClient();
    const [conversations, setConversations] = useState<ConversationWithUserNames[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [selectedRecipientName, setSelectedRecipientName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const fetchConversations = async (userId: string) => {
            // Fetch conversations and join with user table to get user names
            const { data: conversationData, error } = await supabase
                .from("conversation")
                .select(`
                    *,
                    user_one_user: user!conversation_user_one_fkey (name, email, uuid),
                    user_two_user: user!conversation_user_two_fkey (name, email, uuid)
                `)
                .or(`user_one.eq.${userId},user_two.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching conversations:", error);
            } else {
                const enrichedConversations = conversationData.map((conversation) => {
                    if (selectedConversationId && selectedConversationId == conversation.id) {
                        handleConversationClick(conversation)
                    }
                    // Determine the other user
                    const otherUser =
                        conversation.user_one === userId
                            ? conversation.user_two_user
                            : conversation.user_one_user;

                    // Extract the name or email (fallback)
                    const otherUserName = otherUser.name?.trim()
                        ? otherUser.name
                        : otherUser.email;

                    return {
                        ...conversation,
                        otherUserName,
                    };
                });
                setConversations(enrichedConversations);
            }
        };

        if (loggedInUserId) fetchConversations(loggedInUserId as string);
    }, [loggedInUserId, selectedConversationId]);


    const handleConversationClick = (conversation: ConversationWithUserNames) => {
        const recipient =
            conversation.user_one === loggedInUserId
                ? conversation.user_two
                : conversation.user_one;

        setSelectedRecipient(recipient);
        setSelectedRecipientName(conversation.otherUserName); // Set recipient's name for display
    };

    const filteredConversations = conversations.filter((conversation) =>
        conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="flex max-h-screen">
            {/* Left Side: Conversation List */}
            <div className="w-1/4 border-r p-4 overflow-y-scroll bg-gray-200">
                {/* Search input */}
                <p className="font-bold text-2xl mb-2">Chats</p>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search by name or email"
                    className="mb-4 w-full p-2 border rounded-lg"
                />
                <ul>
                    {filteredConversations.map((conversation) => (
                        <li
                            key={conversation.id}
                            className={`px-2 py-4 cursor-pointer rounded-lg hover:bg-gray-100 ${selectedRecipient &&
                                (conversation.user_one === selectedRecipient ||
                                    conversation.user_two === selectedRecipient)
                                ? "bg-gray-100"
                                : ""
                                }`}
                            onClick={() => handleConversationClick(conversation)}
                        >
                            {conversation.otherUserName}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Side: Inbox with recipient's name in a top bar */}
            <div className="flex-1 flex flex-col max-h-screen">
                {loggedInUserId && selectedRecipient ? (
                    <>
                        <div className="bg-gray-100 p-4 flex items-center shadow-md">
                            <p className="font-bold text-lg">
                                {selectedRecipientName || "Chat"}
                            </p>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-white">
                            <Inbox
                                className="h-[80vh]"
                                recipient={selectedRecipient}
                                loggedInUserId={loggedInUserId}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-center text-gray-500">
                            Select a conversation to start chatting
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
