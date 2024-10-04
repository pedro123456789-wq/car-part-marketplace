"use client"

import { FC, useEffect, useState } from "react";
import { User, Message as MessageProp } from "@/app/types_db";
import dayjs from "dayjs"; // You can install this with npm or yarn

interface MessageProps {
    loggedInUserId: string;
    message: MessageProp;
    senderName: string;
    recipientName: string;
}

const MessageItem: FC<MessageProps> = ({ loggedInUserId, message, senderName = "You", recipientName = "" }) => {


    const getUserAvatar = (name: string) => {
        return name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase(); // Use the first character of the name
    };

    // Determine if the message is sent by the logged-in user
    const isSentByLoggedInUser = message.sender_id === loggedInUserId;

    return (
        <div
            key={message.id}
            className={`message-item flex items-center gap-1 mb-3 ${isSentByLoggedInUser ? "justify-end" : "justify-start"
                }`}
        >
            {!isSentByLoggedInUser && (
                <div className="avatar bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                    {getUserAvatar(recipientName)}
                </div>
            )}
            <div
                className={`message-content ml-3 px-2 py-1 rounded-lg ${isSentByLoggedInUser
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-200 text-black"
                    }`}
            >
                <p className="message-text text-sm">{message.content}</p>
                <p className={`message-time text-[9px]  ${isSentByLoggedInUser
                    ? "text-white"
                    : "text-black"
                    }`}>
                    {dayjs(message.created_at).format("HH:mm")}
                </p>
            </div>
            {isSentByLoggedInUser && (
                <div className="avatar bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                    {getUserAvatar(senderName)}
                </div>
            )}
        </div>
    );
};

export default MessageItem;
