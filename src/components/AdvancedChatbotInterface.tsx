import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Brain,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  relevantSections?: Array<{ title: string; section_type: string }>;
}

interface AdvancedChatbotInterfaceProps {
  onClose: () => void;
}

const AdvancedChatbotInterface: React.FC<AdvancedChatbotInterfaceProps> = ({
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Ishmam's AI-powered digital twin with access to my complete professional background. I can tell you about my experience at companies like Optimizely, Gainwell Technologies, my research at COSMOS, my publications, technical skills, and much more. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState<
    string | null
  >(null);
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isTTSAvailable, setIsTTSAvailable] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const retryCountsRef = useRef<Record<number, number>>({});
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize TTS with better voice loading
  const initializeTTS = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      console.log("Speech synthesis not supported");
      return;
    }

    setIsTTSAvailable(true);

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log("Voices loaded:", voices.length);
      }
    };

    // Load voices immediately
    loadVoices();

    // Set up voice loading event listener
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback for browsers that don't fire onvoiceschanged
    if (!voicesLoaded) {
      setTimeout(loadVoices, 1000);
    }
  }, [voicesLoaded]);

  useEffect(() => {
    initializeTTS();

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, [initializeTTS]);

  // Enhanced voice selection function
  // Enhanced voice selection function for male voices across all browsers
  const selectBestMaleVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices();

    // Comprehensive priority list for male voices across different platforms
    const voicePreferences = [
      // High-quality Google voices
      { name: "Google UK English Male", lang: "en-GB" },
      { name: "Google US English Male", lang: "en-US" },

      // Microsoft Windows voices
      { name: "Microsoft David Desktop", lang: "en-US" },
      { name: "Microsoft David", lang: "en-US" },
      { name: "Microsoft Mark", lang: "en-US" },
      { name: "Microsoft Richard", lang: "en-US" },
      { name: "Microsoft George", lang: "en-GB" },

      // macOS/iOS voices
      { name: "Alex", lang: "en-US" },
      { name: "Daniel", lang: "en-GB" },
      { name: "Fred", lang: "en-US" },
      { name: "Oliver", lang: "en-GB" },
      { name: "Arthur", lang: "en-GB" },
      { name: "Albert", lang: "en-US" },

      // Android voices
      { name: "en-us-x-sfg#male_1-local", lang: "en-US" },
      { name: "en-us-x-sfg#male_2-local", lang: "en-US" },
      { name: "en-gb-x-gbg#male_1-local", lang: "en-GB" },
      { name: "en-gb-x-gbg#male_2-local", lang: "en-GB" },

      // Chrome OS voices
      { name: "Chrome OS US English 1", lang: "en-US" },
      { name: "Chrome OS UK English 1", lang: "en-GB" },

      // Generic pattern matching (regex patterns)
      { pattern: /male/i, lang: /^en/ },
      {
        pattern:
          /(david|daniel|alex|fred|oliver|arthur|albert|george|mark|richard|james|john|michael|robert|william|thomas|charles|christopher|matthew|anthony|donald|steven|paul|andrew|joshua|kenneth|kevin|brian|edward|ronald|timothy|jason|jeffrey|ryan|jacob|gary|nicholas|eric|jonathan|stephen|larry|justin|scott|brandon|benjamin|samuel|gregory|frank|raymond|alexander|patrick|jack|dennis|jerry|tyler|aaron|jose|henry|adam|douglas|nathan|peter|zachary|kyle|noah|alan|ethan|lucas|jeremy|jose|harold|walter|peter|carl|arthur|roger|albert|joe|sean|bryan|wayne|louis|eugene|roy|juan|mason|lawrence|bobby|austin|oscar|christian|lee|craig|arthur|noah|owen|liam|eli|carlos|antonio|henry|jesus|jeremy|alan|keith|ethan)/i,
        lang: /^en/,
      },

      // Fallback patterns
      { pattern: /man/i, lang: /^en/ },
      { pattern: /guy/i, lang: /^en/ },
      { pattern: /boy/i, lang: /^en/ },
    ];

    // Helper function to check if voice matches preference
    const matchesPreference = (voice, pref) => {
      let nameMatch = false;
      let langMatch = false;

      // Check name/pattern match
      if (pref.name) {
        nameMatch =
          typeof pref.name === "string"
            ? voice.name.includes(pref.name)
            : pref.name.test(voice.name);
      } else if (pref.pattern) {
        nameMatch = pref.pattern.test(voice.name);
      }

      // Check language match
      if (typeof pref.lang === "string") {
        langMatch = voice.lang.startsWith(pref.lang);
      } else if (pref.lang instanceof RegExp) {
        langMatch = pref.lang.test(voice.lang);
      }

      return nameMatch && langMatch;
    };

    // Try to find the best matching voice
    for (const pref of voicePreferences) {
      const voice = voices.find((v) => matchesPreference(v, pref));
      if (voice) {
        console.log(`Selected voice: ${voice.name} (${voice.lang})`);
        return voice;
      }
    }

    // Enhanced fallback: look for any English voice that might be male
    const potentialMaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        !/(female|woman|girl|lady|she|her|feminine)/i.test(v.name)
    );

    if (potentialMaleVoice) {
      console.log(
        `Fallback voice: ${potentialMaleVoice.name} (${potentialMaleVoice.lang})`
      );
      return potentialMaleVoice;
    }

    // Final fallback: any English voice or first available
    const englishVoice = voices.find((v) => v.lang.startsWith("en"));
    const finalVoice = englishVoice || voices[0];

    if (finalVoice) {
      console.log(
        `Final fallback voice: ${finalVoice.name} (${finalVoice.lang})`
      );
    }

    return finalVoice;
  }, []);

  // Enhanced speak text function
  const speakText = useCallback(
    (text: string, messageId?: string) => {
      if (!isTTSAvailable || !isTTSEnabled || !text.trim()) {
        return;
      }

      // Prevent speaking the same message if it's already being processed
      if (messageId && currentSpeakingMessageId === messageId) {
        console.log("Already speaking this message, skipping");
        return;
      }

      // Stop any current speech
      if (currentUtteranceRef.current) {
        speechSynthesis.cancel();
        currentUtteranceRef.current = null;
      }

      // Clear any pending timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      // Split into optimized chunks
      const chunks = splitTextIntoChunks(text);

      console.log(`Speaking ${chunks.length} chunks for message:`, messageId);

      retryCountsRef.current = {};
      setSpeechQueue(chunks);
      setCurrentChunkIndex(0);
      setCurrentSpeakingMessageId(messageId || null);

      // Small delay to ensure UI updates
      setTimeout(() => {
        speakChunks(chunks, 0);
      }, 100);
    },
    [isTTSAvailable, isTTSEnabled, currentSpeakingMessageId] // Removed speakChunks dependency
  );

  useEffect(() => {
    if (!isTTSAvailable || !isTTSEnabled || !voicesLoaded) return;

    const lastMessage = messages[messages.length - 1];

    // Only read brand-new bot replies that we haven't already started speaking
    if (
      lastMessage &&
      lastMessage.isBot &&
      lastMessage.id !== currentSpeakingMessageId &&
      !isSpeaking &&
      !isProcessingSpeech
    ) {
      console.log("Auto-reading new bot message:", lastMessage.id);

      const timer = setTimeout(() => {
        // Double-check we're still not speaking before starting
        if (!isSpeaking && !isProcessingSpeech) {
          speakText(lastMessage.text, lastMessage.id);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    messages, // Only depend on messages array
    isTTSAvailable,
    isTTSEnabled,
    voicesLoaded,
    currentSpeakingMessageId,
    isSpeaking,
    isProcessingSpeech,
    // Remove speakText from dependencies to prevent infinite loop
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Improved chunk splitting for better speech flow
  const splitTextIntoChunks = (text: string, maxLength = 150): string[] => {
    // Clean text first
    const cleanText = text
      .replace(/[*_`#]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Split by sentences first
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();

      // If adding this sentence would exceed max length, start a new chunk
      if (
        currentChunk &&
        currentChunk.length + trimmedSentence.length + 1 > maxLength
      ) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else if (trimmedSentence.length > maxLength) {
        // If sentence itself is too long, split by commas or words
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }

        // Try splitting by commas first
        const parts = trimmedSentence.split(/,\s*/);
        if (parts.length > 1) {
          parts.forEach((part, idx) => {
            const partWithComma = idx < parts.length - 1 ? part + "," : part;
            if (
              currentChunk &&
              currentChunk.length + partWithComma.length + 1 > maxLength
            ) {
              chunks.push(currentChunk.trim());
              currentChunk = partWithComma;
            } else {
              currentChunk += (currentChunk ? " " : "") + partWithComma;
            }
          });
        } else {
          // Split by words as last resort
          const words = trimmedSentence.split(" ");
          words.forEach((word) => {
            if (
              currentChunk &&
              currentChunk.length + word.length + 1 > maxLength
            ) {
              chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              currentChunk += (currentChunk ? " " : "") + word;
            }
          });
        }
      } else {
        currentChunk += (currentChunk ? " " : "") + trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter((chunk) => chunk.length > 0);
  };

  // Enhanced speech synthesis with better error'Universidad handling
  // Enhanced speech synthesis with better error handling and proper completion
  const speakChunks = useCallback(
    (chunks: string[], startIndex: number = 0) => {
      // Check if we've reached the end of all chunks
      if (startIndex >= chunks.length || !isTTSEnabled) {
        // Clean up and stop everything when all chunks are complete
        setIsSpeaking(false);
        setIsProcessingSpeech(false);
        setCurrentSpeakingMessageId(null);
        setSpeechQueue([]);
        setCurrentChunkIndex(0);
        currentUtteranceRef.current = null;

        // Clear any pending timeouts
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }

        return;
      }

      // Clear any existing timeout
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      const chunk = chunks[startIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);
      currentUtteranceRef.current = utterance;
      setCurrentChunkIndex(startIndex);
      setIsProcessingSpeech(true);

      // Configure speech settings for deep male voice
      utterance.rate = 1.2; // Slower for deeper effect
      utterance.pitch = 0.5; // Lower pitch for deeper voice
      utterance.volume = 1.0; // Full volume
      utterance.lang = "en-US";

      // Select the best available voice
      const bestVoice = selectBestMaleVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`Using voice: ${bestVoice.name}`);
      }

      let hasStarted = false;
      let hasEnded = false;

      // Set up event handlers
      utterance.onstart = () => {
        hasStarted = true;
        setIsSpeaking(true);
        setIsProcessingSpeech(false);

        // Clear timeout since speech started successfully
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
      };

      utterance.onend = () => {
        hasEnded = true;
        console.log(`Finished chunk ${startIndex + 1} of ${chunks.length}`);

        // Check if this was the last chunk
        if (startIndex + 1 >= chunks.length) {
          console.log("All chunks completed, stopping speech");
          // This was the last chunk - clean up and stop
          setIsSpeaking(false);
          setIsProcessingSpeech(false);
          setCurrentSpeakingMessageId(null);
          setSpeechQueue([]);
          setCurrentChunkIndex(0);
          currentUtteranceRef.current = null;
          return;
        }

        // Continue to next chunk with a small pause for natural flow
        setTimeout(() => {
          speakChunks(chunks, startIndex + 1);
        }, 300);
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error, "for chunk:", chunk);
        setIsProcessingSpeech(false);

        // Common errors and their handling
        if (event.error === "interrupted") {
          // User interrupted, don't continue
          setIsSpeaking(false);
          setCurrentSpeakingMessageId(null);
          setSpeechQueue([]);
          setCurrentChunkIndex(0);
          currentUtteranceRef.current = null;
          return;
        }

        // For other errors, try the next chunk after a delay
        // But only if we haven't reached the end
        if (startIndex + 1 < chunks.length) {
          setTimeout(() => {
            speakChunks(chunks, startIndex + 1);
          }, 500);
        } else {
          // This was the last chunk and it errored - clean up
          setIsSpeaking(false);
          setIsProcessingSpeech(false);
          setCurrentSpeakingMessageId(null);
          setSpeechQueue([]);
          setCurrentChunkIndex(0);
          currentUtteranceRef.current = null;
        }
      };

      // Try to speak
      try {
        // Cancel any pending speech first
        speechSynthesis.cancel();

        // Small delay to ensure cancellation is processed
        setTimeout(() => {
          speechSynthesis.speak(utterance);

          // Set a timeout to handle cases where speech doesn't start
          speechTimeoutRef.current = setTimeout(() => {
            if (!hasStarted && !hasEnded) {
              console.warn("Speech didn't start, moving to next chunk");
              speechSynthesis.cancel();

              // Only continue if there are more chunks
              if (startIndex + 1 < chunks.length) {
                speakChunks(chunks, startIndex + 1);
              } else {
                // This was the last chunk - clean up
                setIsSpeaking(false);
                setIsProcessingSpeech(false);
                setCurrentSpeakingMessageId(null);
                setSpeechQueue([]);
                setCurrentChunkIndex(0);
                currentUtteranceRef.current = null;
              }
            }
          }, 3000);
        }, 100);
      } catch (error) {
        console.error("Error speaking chunk:", error);
        setIsProcessingSpeech(false);

        // Only continue if there are more chunks
        if (startIndex + 1 < chunks.length) {
          setTimeout(() => {
            speakChunks(chunks, startIndex + 1);
          }, 500);
        } else {
          // This was the last chunk - clean up
          setIsSpeaking(false);
          setIsProcessingSpeech(false);
          setCurrentSpeakingMessageId(null);
          setSpeechQueue([]);
          setCurrentChunkIndex(0);
          currentUtteranceRef.current = null;
        }
      }
    },
    [isTTSEnabled, selectBestMaleVoice]
  );

  // Enhanced stop speaking function
  const stopSpeaking = useCallback(() => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }

    setIsSpeaking(false);
    setIsProcessingSpeech(false);
    setCurrentSpeakingMessageId(null);
    setSpeechQueue([]);
    setCurrentChunkIndex(0);
  }, []);

  // Toggle speech for a specific message
  const toggleMessageSpeech = useCallback(
    (messageText: string, messageId: string) => {
      if (currentSpeakingMessageId === messageId && isSpeaking) {
        // Currently speaking this message - stop it
        stopSpeaking();
      } else if (
        currentSpeakingMessageId === messageId &&
        !isSpeaking &&
        speechQueue.length > 0
      ) {
        // Same message, resume from current position
        speakChunks(speechQueue, currentChunkIndex);
      } else {
        // Different message or restart - start from beginning
        speakText(messageText, messageId);
      }
    },
    [
      currentSpeakingMessageId,
      isSpeaking,
      speechQueue,
      currentChunkIndex,
      stopSpeaking,
      speakText,
      speakChunks,
    ]
  );

  // Update the speech button to show processing state
  const getMessageSpeechButton = useCallback(
    (messageId: string) => {
      if (currentSpeakingMessageId === messageId && isProcessingSpeech) {
        return { icon: "processing", title: "Processing speech..." };
      } else if (currentSpeakingMessageId === messageId && isSpeaking) {
        return { icon: "pause", title: "Pause message" };
      } else if (
        currentSpeakingMessageId === messageId &&
        speechQueue.length > 0
      ) {
        return { icon: "resume", title: "Resume message" };
      } else {
        return { icon: "play", title: "Play message" };
      }
    },
    [
      currentSpeakingMessageId,
      isSpeaking,
      isProcessingSpeech,
      speechQueue.length,
    ]
  );

  // Toggle TTS with better feedback
  const toggleTTS = useCallback(() => {
    const newState = !isTTSEnabled;

    if (isSpeaking) {
      stopSpeaking();
    }

    setIsTTSEnabled(newState);

    toast({
      title: newState ? "Voice Enabled" : "Voice Disabled",
      description: newState
        ? "Messages will be read aloud"
        : "Voice reading disabled",
    });

    // Test TTS when enabling
    if (newState && voicesLoaded) {
      setTimeout(() => {
        speakText("Voice is now enabled");
      }, 500);
    }
  }, [isTTSEnabled, isSpeaking, stopSpeaking, voicesLoaded, speakText, toast]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsTyping(true);

    // Stop any current speech when sending a message
    if (isSpeaking || isProcessingSpeech) {
      stopSpeaking();
    }

    try {
      const { data, error } = await supabase.functions.invoke("rag-chat", {
        body: { message: currentInput },
      });

      if (error) {
        throw error;
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isBot: true,
        timestamp: new Date(),
        relevantSections: data.relevantSections,
      };

      setMessages((prev) => [...prev, botResponse]);

      // Note: Don't manually trigger speakText here - let the useEffect handle it
    } catch (error: unknown) {
      console.error("Error getting AI response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      // Note: Don't manually trigger speakText here either - let the useEffect handle it

      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to get AI response. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isTyping) {
      // Form will handle the submit
    }
  };

  const suggestedQuestions = [
    "Tell me about your experience at Optimizely",
    "What AI/ML projects have you worked on?",
    "What are your technical skills?",
    "Tell me about your research publications",
    "What's your educational background?",
  ];

  return (
    <div
      className="bg-cyber-darker border-2 border-neon-purple rounded-lg p-4 max-w-2xl w-full animate-fade-in h-[22.5rem] flex flex-col"
      tabIndex={-1}
      style={{
        minHeight: "22.5rem",
        maxHeight: "22.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neon-purple/30">
        <div className="flex items-center gap-2">
          <Brain className="text-neon-green w-5 h-5" />
          <span className="text-neon-yellow font-semibold">
            AI-Powered Digital Twin
          </span>
          <div className="flex items-center gap-1 text-xs text-neon-pink">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
            RAG Enabled
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isTTSAvailable && (
            <Button
              type="button"
              onClick={toggleTTS}
              variant="ghost"
              size="icon"
              className={`text-neon-pink hover:text-neon-yellow hover:bg-neon-purple/20 ${
                isTTSEnabled ? "bg-neon-purple/20" : ""
              }`}
              title={isTTSEnabled ? "Disable voice" : "Enable voice"}
            >
              {isTTSEnabled ? (
                <Volume2
                  className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`}
                />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-neon-pink hover:text-neon-yellow hover:bg-neon-purple/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-neon-purple scrollbar-track-cyber-dark"
        style={{ minHeight: 0 }}
      >
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex items-start gap-2 ${
                message.isBot ? "justify-start" : "justify-end"
              }`}
            >
              {message.isBot && (
                <div className="flex items-center gap-1">
                  <Brain className="text-neon-green w-4 h-4 mt-1 flex-shrink-0" />
                  {isTTSAvailable && voicesLoaded && (
                    <button
                      onClick={() =>
                        toggleMessageSpeech(message.text, message.id)
                      }
                      className={`text-neon-pink hover:text-neon-yellow p-0.5 rounded hover:bg-neon-purple/20 transition-colors ${
                        currentSpeakingMessageId === message.id && isSpeaking
                          ? "bg-neon-purple/20"
                          : ""
                      }`}
                      title={getMessageSpeechButton(message.id).title}
                    >
                      {(() => {
                        const buttonState = getMessageSpeechButton(message.id);
                        if (buttonState.icon === "processing") {
                          return <Loader2 className="w-3 h-3 animate-spin" />;
                        } else if (buttonState.icon === "pause") {
                          return <VolumeX className="w-3 h-3 animate-pulse" />;
                        } else if (buttonState.icon === "resume") {
                          return <Volume2 className="w-3 h-3 opacity-70" />;
                        } else {
                          return <Volume2 className="w-3 h-3" />;
                        }
                      })()}
                    </button>
                  )}
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  message.isBot
                    ? "bg-neon-purple/20 text-neon-green border border-neon-purple/30"
                    : "bg-neon-green/20 text-neon-yellow border border-neon-green/30"
                }`}
              >
                {message.text}
              </div>
              {!message.isBot && (
                <User className="text-neon-yellow w-4 h-4 mt-1 flex-shrink-0" />
              )}
            </div>

            {/* Show relevant sections used for context */}
            {message.isBot &&
              message.relevantSections &&
              message.relevantSections.length > 0 && (
                <div className="ml-6 text-xs text-neon-pink/70">
                  <div className="flex items-center gap-1 mb-1">
                    <Brain className="w-3 h-3" />
                    <span>Referenced:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {message.relevantSections.map((section, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-neon-purple/10 border border-neon-purple/20 rounded text-xs"
                      >
                        {section.section_type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2">
            <Brain className="text-neon-green w-4 h-4 mt-1 flex-shrink-0" />
            <div className="bg-neon-purple/20 text-neon-green border border-neon-purple/30 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing your question...</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions for new conversations */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <div className="text-xs text-neon-pink/70 ml-6">Try asking:</div>
            <div className="ml-6 space-y-1">
              {suggestedQuestions.slice(0, 3).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(question)}
                  className="block text-xs text-neon-green/80 hover:text-neon-yellow bg-cyber-dark/50 hover:bg-neon-purple/10 border border-neon-purple/20 rounded px-2 py-1 text-left w-full transition-colors"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="flex gap-2" onSubmit={handleSendMessage}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Ask me about my experience, skills, projects..."
          className="flex-1 bg-cyber-dark border-neon-purple/50 text-neon-green placeholder:text-neon-pink/70 focus:border-neon-green"
          disabled={isTyping}
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="bg-neon-green hover:bg-neon-green/80 text-cyber-dark"
        >
          {isTyping ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdvancedChatbotInterface;
