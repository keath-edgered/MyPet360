import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/firebase/firebase";
import Chat from "@/firebase/Chat";
import { db } from "@/firebase/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

interface Conversation {
  id: string;
  participants: string[];
  participantInfo: {
    [key: string]: {
      name: string;
      initials: string;
    }
  };
  lastMessage?: {
    text: string;
    timestamp: any; // Firestore Timestamp
    senderId: string;
  };
  relatedPetName: string;
  lastUpdatedAt: any; // Firestore Timestamp
  unread?: boolean;
}

const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp || !timestamp.toDate) return '';
  const date = timestamp.toDate();
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
};

const InboxView = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Make the component reactive to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    const conversationsQuery = query(
      collection(db, 'ChatApp'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastUpdatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(conversationsQuery, (querySnapshot) => {
      const convos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const unread =
          !!data.lastMessage &&
          data.lastMessage.senderId !== currentUser.uid;
        return { id: doc.id, ...data, unread } as Conversation;
      });
      setConversations(convos);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching conversations: ", error);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getRecipient = (convo: Conversation) => {
    if (!currentUser) return { id: '', name: 'Unknown', initials: '?' };
    const recipientId = convo.participants.find(p => p !== currentUser.uid) || '';
    return {
      id: recipientId,
      name: convo.participantInfo?.[recipientId]?.name || 'Unknown User',
      initials: convo.participantInfo?.[recipientId]?.initials || 'U',
    };
  };

  if (selectedConversation) {
    return (
      <div className="border rounded-lg overflow-hidden h-[600px]">
        <Chat
          conversationId={selectedConversation.id}
          recipient={getRecipient(selectedConversation)}
          onBack={() => setSelectedConversation(null)}
          relatedPetName={selectedConversation.relatedPetName}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Messages from people who may have found your pet.
      </p>
      {loadingMessages ? (
        <div className="py-16 text-center text-muted-foreground">Loading messages...</div>
      ) : conversations.map((convo, i) => {
        const recipient = getRecipient(convo);
        return (
          <motion.div
            key={convo.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            onClick={() => setSelectedConversation(convo)}
          >
            <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:card-shadow-hover">
              <CardContent className="flex items-center gap-4 p-5">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                    {recipient.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-card-foreground">{recipient.name}</span>
                    <span className="text-xs text-muted-foreground">- Pet Name: <span className="font-bold text-inherit">{convo.relatedPetName}</span></span>
                    {convo.unread && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {convo.lastMessage?.text || 'No messages yet.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(convo.lastMessage?.timestamp)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
      {conversations.length === 0 && !loadingMessages && (
        <div className="py-16 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="font-medium">No messages yet</p>
          <p className="mt-1 text-sm">When someone spots your pet, they'll message you here.</p>
        </div>
      )}
    </div>
  );
};

export default InboxView;