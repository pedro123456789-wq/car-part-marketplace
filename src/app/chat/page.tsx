"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import searchParams hook
import Chat from "../components/Message/Chat";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import NavigationBar from "../components/NavigationBar";

const Page = () => {
    const supabase = createFrontEndClient();
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [newRecipient, setNewRecipient] = useState<string | null>(null); // Track newRecipient for passing to Chat

    const searchParams = useSearchParams();
    const newChat = searchParams.get("newChat");
    const newRecipientId = searchParams.get("newRecipientId");

    useEffect(() => {
        const fetchLoggedInUser = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error fetching session:", error);
            } else if (data.session?.user) {
                const userId = data.session.user.id;
                setLoggedInUserId(userId);

                // If newChat is true and newRecipientId is provided, create new conversation
                if (newRecipientId) {

                    createNewConversation(userId, newRecipientId);
                }
            }
        };

        const createNewConversation = async (loggedInUserId: string, recipientId: string) => {
            try {
                // Check if a conversation already exists between loggedInUserId and recipientId
                const { data: existingConversation, error: conversationCheckError } = await supabase
                    .from("conversation")
                    .select("*")
                    .or(`user_one.eq.${loggedInUserId},user_two.eq.${loggedInUserId}`)
                    .or(`user_one.eq.${recipientId},user_two.eq.${recipientId}`)
                    .maybeSingle();

                if (conversationCheckError && conversationCheckError.code !== "PGRST116") {
                    throw conversationCheckError; // Handle other errors, except "no data" error
                }

                let conversationId;

                if (existingConversation) {
                    // Conversation already exists, use the existing conversation ID
                    conversationId = existingConversation.id;
                    console.log("Conversation already exists:", conversationId);
                } else {
                    // No conversation exists, create a new one
                    const { data: newConversation, error } = await supabase
                        .from("conversation")
                        .insert({
                            user_one: loggedInUserId,
                            user_two: recipientId,
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    conversationId = newConversation.id;
                    console.log("Created new conversation:", conversationId);

                    // Insert first message in the new conversation
                    // const { error: messageError } = await supabase.from("messages").insert({
                    //     sender_id: loggedInUserId,
                    //     conversation_id: conversationId,
                    //     content: "Hi, Nice to meet you.",
                    // });

                    // if (messageError) throw messageError;
                }

                // Set newRecipient to be passed to the Chat component
                setNewRecipient(recipientId);

            } catch (err) {
                console.error("Error creating or fetching conversation:", err);
            }
        };

        fetchLoggedInUser();
    }, []);

    return (
        <div>
            <NavigationBar />
            <Chat loggedInUserId={loggedInUserId} newRecipient={newRecipient} />
        </div>
    );
};

export default Page;
