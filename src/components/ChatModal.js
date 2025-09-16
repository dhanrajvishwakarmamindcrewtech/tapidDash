import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import styles from './ChatModal.module.css';
import { useApp } from '../context/CoreContext';

const OPENAI_API_KEY = "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";

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestedQuestions = [
    {
      id: 1,
      question: "Show me sales analytics",
      description: "View your sales performance and trends",
      icon: BarChart3,
    },
    {
      id: 2,
      question: "Customer demographics",
      description: "Analyze your customer base",
      icon: Users,
    },
    {
      id: 3,
      question: "Campaign performance",
      description: "Review your marketing campaigns",
      icon: Target,
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputValue]);

  const { demographicsData, businessApiData } = useApp();

  // Determine business name for personalization
  const businessName = businessApiData?.businessData?.info?.businessName || 'there';

  function strongDemographicsPrompt(data) {
    if (!data) return '';
    return `Customer Demographics (use ONLY these numbers, but provide varied and realistic responses):\n` +
      `- Total users: ${data.totalUsers ?? 'N/A'}\n` +
      `- Average age: ${data.averageAge ?? 'N/A'}\n` +
      `- Most common age: ${data.mostCommonAge ?? 'N/A'}\n` +
      `- Most common gender: ${data.mostCommonGender ?? 'N/A'}\n` +
      `- Gender breakdown: ${(data.genderBreakdown ? Object.entries(data.genderBreakdown).map(([k,v]) => `${k}: ${v}`).join(', ') : 'N/A')}\n` +
      `- Age group breakdown: ${(data.ageGroupBreakdown ? Object.entries(data.ageGroupBreakdown).map(([k,v]) => `${k}: ${v}`).join(', ') : 'N/A')}\n` +
      `- Top 3 preferences: ${(data.topPreferences ? data.topPreferences.join(', ') : 'N/A')}\n` +
      `\nWhen asked about demographics, provide varied responses like:\n` +
      `- "Your customer base shows a strong concentration of ${data.mostCommonAge}-year-olds, making up about X% of your total audience. Would you like to know more about gender breakdown, age groups, or top customer preferences?"\n` +
      `- "The average age across your customer base is ${data.averageAge}, with a notable peak in the ${data.mostCommonAge} age group. I can also provide insights into gender distribution or customer preferences if you're interested!"\n` +
      `- "Your most active demographic segment is ${data.mostCommonGender} customers aged ${data.mostCommonAge}. Would you like to explore gender breakdown, age groups, or top preferences next?"\n` +
      `- "Looking at your customer distribution, ${data.mostCommonAge}-year-olds are your primary demographic, followed by... Would you like to dive deeper into gender, age groups, or preferences?"\n`;
  }

  function strongBusinessPrompt(data) {
    if (!data) return '';
    return `Business Data (use ONLY these values):\n` +
      `- Business name: ${data.info?.businessName ?? 'N/A'}\n` +
      `- Industry: ${data.info?.industry ?? 'N/A'}\n` +
      `- Subscription plan: ${data.subscription?.plan ?? 'N/A'}\n`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Switch to chat view
    setShowChat(true);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Assistant acknowledgement message
    const ackMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: 'Super, let me check that out for you...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, ackMessage]);

    // Show typing indicator while "fetching" fake data
    setIsLoading(true);

    // Fake data response after delay
    setTimeout(() => {
      const fakeDataMessage = {
        id: Date.now() + 2,
        type: 'assistant',
        content:
          'Here are some sample insights for now:\n' +
          '- Total sales this month: $23,456\n' +
          '- Average order value: $45.67\n' +
          '- Top selling item: Latte\n' +
          '- New loyalty sign-ups: 128',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fakeDataMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  const handleBack = () => {
    setShowChat(false);
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!showChat ? (
          // Welcome Screen
          <>
            {/* Header */}
            <div className={styles.header}>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Welcome Content */}
            <div className={styles.welcomeContent}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatar}>
                  <MessageCircle size={24} />
                </div>
              </div>
              
              <div className={styles.welcomeText}>
                <h2 className={styles.welcomeTitle}>
                  {businessName.toLowerCase().includes('my business') ? 'Good afternoon' : `Hi ${businessName}`}
                </h2>
                <p className={styles.welcomeSubtitle}>How can Tapid help you today?</p>
                <p className={styles.welcomeDescription}>
                  I'm here to help you explore your business data, analyze customer insights, 
                  and answer questions about your loyalty program performance.
                </p>
              </div>

              <div className={styles.suggestionsGrid}>
                {suggestedQuestions.map((suggestion) => {
                  const IconComponent = suggestion.icon;
                  return (
                    <button
                      key={suggestion.id}
                      className={styles.suggestionCard}
                      onClick={() => handleSuggestedQuestion(suggestion.question)}
                    >
                      <div className={styles.suggestionIcon}>
                        <IconComponent size={20} />
                      </div>
                      <div className={styles.suggestionContent}>
                        <div className={styles.suggestionTitle}>{suggestion.question}</div>
                        <div className={styles.suggestionDesc}>{suggestion.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className={styles.inputContainer}>
              <form className={styles.inputForm} onSubmit={handleSubmit}>
                <div className={styles.textareaContainer}>
                  <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder="Type your question here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          // Chat View
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                ← Back
              </button>
              <div className={styles.chatTitle}>
                <div className={styles.chatAvatar}>
                  <MessageCircle size={16} />
                </div>
                <span>Galileo Assistant</span>
              </div>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              <div className={styles.messagesWrapper}>
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`${styles.messageGroup} ${styles[message.type]}`}
                  >
                    {message.type === 'user' ? (
                      <div className={styles.userMessage}>
                        <div className={styles.userContent}>
                          <div className={styles.messageText}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.assistantMessage}>
                        <div className={styles.assistantAvatar}>
                          <MessageCircle size={16} />
                        </div>
                        <div className={styles.assistantContent}>
                          <div className={styles.messageText}>
                            {message.content.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i < message.content.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className={`${styles.messageGroup} ${styles.assistant}`}>
                    <div className={styles.assistantMessage}>
                      <div className={styles.assistantAvatar}>
                        <MessageCircle size={16} />
                      </div>
                      <div className={styles.assistantContent}>
                        <div className={styles.typingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className={styles.inputContainer}>
              <form className={styles.inputForm} onSubmit={handleSubmit}>
                <div className={styles.textareaContainer}>
                  <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatModal; 