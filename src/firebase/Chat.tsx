import { useState, useEffect, useRef } from 'react';
import { auth } from '@/firebase/firebase';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { db } from '@/firebase/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface ChatProps {
  conversationId: string;
  recipient: { id: string; name: string; initials: string };
  onBack: () => void;
  relatedPetName: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any; // Firestore timestamp
}

const Chat = ({ conversationId, recipient, onBack, relatedPetName }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Make the component reactive to auth state changes for robustness
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!conversationId) return;

    const messagesQuery = query(
      collection(db, 'ChatApp', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messagesColRef = collection(db, 'ChatApp', conversationId, 'messages');
    await addDoc(messagesColRef, {
      text: newMessage.trim(),
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    // Update the `last_message` details in the `conversations` table.
    const conversationDocRef = doc(db, 'ChatApp', conversationId);
    await updateDoc(conversationDocRef, {
      lastMessage: {
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        senderId: currentUser.uid,
      },
      lastUpdatedAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback>{recipient.initials}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="font-semibold text-card-foreground">{recipient.name}</p>
          <p className="text-xs text-muted-foreground"> Pet Name: <span className="font-bold text-inherit">{relatedPetName}</span> 
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
          >
            {msg.senderId !== currentUser.uid && (
              <Avatar className="h-8 w-8 shrink-0"><AvatarFallback>{recipient.initials}</AvatarFallback></Avatar>
            )}
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${msg.senderId === currentUser.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border bg-background/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" autoComplete="off" />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;