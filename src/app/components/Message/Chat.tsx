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
    newRecipient: string | null;
}

const Chat: FC<ChatProps> = ({ loggedInUserId, newRecipient = null }) => {
    const supabase = createFrontEndClient();
    const [conversations, setConversations] = useState<ConversationWithUserNames[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const fetchConversations = async (userId: string) => {
            const { data: conversationData, error } = await supabase
                .from("conversation")
                .select("*")
                .or(`user_one.eq.${userId},user_two.eq.${userId}`);

            if (error) {
                console.error("Error fetching conversations:", error);
            } else {
                const enrichedConversations = await enrichConversationsWithUserNames(
                    conversationData,
                    userId
                );
                setConversations(enrichedConversations);
            }
        };

        const enrichConversationsWithUserNames = async (
            conversations: Conversation[],
            userId: string
        ): Promise<ConversationWithUserNames[]> => {
            return await Promise.all(
                conversations.map(async (conversation) => {
                    const otherUserId =
                        conversation.user_one === userId
                            ? conversation.user_two
                            : conversation.user_one;

                    const otherUserName = await fetchUserName(otherUserId);
                    return {
                        ...conversation,
                        otherUserName,
                    };
                })
            );
        };

        const fetchUserName = async (userId: string): Promise<string> => {
            const { data: user, error } = await supabase
                .from("user")
                .select("name, email")
                .eq("uuid", userId)
                .single();

            if (error) {
                console.error("Error fetching user:", error);
                return "Unknown User";
            }

            // Fallback to email if name is not available or empty
            if (!user?.name?.trim()) {
                return user.email.split("@")[0]; // Extract email part before "@"
            }

            return user.name;
        };

        if (loggedInUserId)
            fetchConversations(loggedInUserId as string);
    }, [loggedInUserId]);

    const handleConversationClick = (conversation: ConversationWithUserNames) => {
        // Determine the other user in the conversation
        const recipient =
            conversation.user_one === loggedInUserId
                ? conversation.user_two
                : conversation.user_one;

        setSelectedRecipient(recipient); // Set the recipient to pass to Inbox
    };

    const filteredConversations = conversations.filter((conversation) =>
        conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (newRecipient)
            setSelectedRecipient(newRecipient)
    }, [newRecipient])
    return (
        <div className="flex h-screen">
            {/* Left Side: Conversation List */}
            <div className="w-1/4 border-r p-4 overflow-y-auto">
                {/* Search input */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email"
                    className="mb-4 w-full p-2 border rounded"
                />
                <ul>
                    {filteredConversations.map((conversation) => (
                        <li
                            key={conversation.id}
                            className={`px-2 py-4 cursor-pointer hover:bg-gray-100 ${selectedRecipient &&
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

            {/* Right Side: Inbox */}
            <div className="flex-1 p-4">
                {loggedInUserId && selectedRecipient ? (
                    <Inbox
                        className="h-[90vh]"
                        recipient={selectedRecipient}
                        loggedInUserId={loggedInUserId}
                    />
                ) : (
                    <p className="text-center text-gray-500">
                        Select a conversation to start chatting
                    </p>
                )}
            </div>
        </div>
    );
};

export default Chat;
