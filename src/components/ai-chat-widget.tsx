'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Bot, MessageCircle, Send, X, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: 'Olá! Sou a IA integrada. Como posso ajudar a gerir a frota hoje?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
        const aiResponse: Message = { type: 'ai', text: `Recebi sua mensagem: "${userMessage.text}". No momento, estou em modo de demonstração.` };
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
    }, 1500);
  };
  
  // In a real app, you would call your server action here
  // const result = await callGeminiAction(input);
  // if (result.success) {
  //   const aiResponse: Message = { type: 'ai', text: result.response };
  //    setMessages((prev) => [...prev, aiResponse]);
  // } else {
  //    toast({ variant: 'destructive', title: 'Erro de IA', description: result.error });
  // }
  // setIsLoading(false);


  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <Card
        className={cn(
          'w-[380px] h-[550px] flex-col overflow-hidden shadow-2xl border-2',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'flex' : 'hidden'
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-foreground text-background">
          <div className="flex items-center gap-2">
            <Bot className="text-accent" />
            <div className="flex flex-col">
              <span className="font-bold text-sm">Assistente Virtual</span>
              <span className="text-xs text-muted-foreground">FleetWise AI</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-background" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-grow p-3 bg-muted/30">
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-3 p-1">
                {messages.map((msg, index) => (
                    <div
                    key={index}
                    className={cn(
                        'p-3 rounded-lg max-w-[85%] text-sm',
                        msg.type === 'user' ? 'bg-primary text-primary-foreground self-end rounded-br-none' : 'bg-card text-card-foreground self-start rounded-bl-none'
                    )}
                    >
                    {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="p-3 rounded-lg max-w-[85%] text-sm bg-card text-card-foreground self-start rounded-bl-none flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                        <span className="text-muted-foreground italic">Digitando...</span>
                    </div>
                )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 border-t bg-card">
          <div className="flex w-full items-center gap-2">
            <Input
              type="text"
              placeholder="Pergunte algo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-xl"
        size="icon"
      >
        <MessageCircle className="h-8 w-8" />
      </Button>
    </div>
  );
}
