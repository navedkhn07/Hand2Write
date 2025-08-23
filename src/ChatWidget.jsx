import React, { useState, useEffect } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestedQuestions = [
    'How does Hand2Write work?',
    'What are your pricing plans?',
    'How do you ensure quality?',
    'Tell me about your writers',
    'How long does it take?',
    'Is my information secure?'
  ];

  useEffect(() => {
    const handleExternalTrigger = () => {
      setIsOpen(true);
      handleAutomatedResponse('Welcome to Hand2Write Support! 👋 I can help you with information about our services. Choose a question below or ask your own!');
    };

    window.addEventListener('openChat', handleExternalTrigger);
    return () => window.removeEventListener('openChat', handleExternalTrigger);
  }, []);

  const handleAutomatedResponse = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getAutomatedResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Project Overview and Features
    if (lowerMessage.includes('what') && lowerMessage.includes('hand2write') || 
        lowerMessage.includes('about') && lowerMessage.includes('platform')) {
      return 'Hand2Write is a platform connecting students with verified handwriting experts. Our service helps students convert their digital notes into handwritten format, perfect for various academic needs. We ensure quality, originality, and timely delivery of all work.';
    }

    // How It Works
    if (lowerMessage.includes('how') && lowerMessage.includes('work') || 
        lowerMessage.includes('process')) {
      return 'Here\'s how Hand2Write works:\n1. Students upload their digital content\n2. They choose a writer based on style and ratings\n3. Writers convert the content to handwritten format\n4. Quality check is performed\n5. The final work is delivered to the student\nWould you like more details about any of these steps?';
    }

    // Writer Information
    if (lowerMessage.includes('writer') || lowerMessage.includes('expert')) {
      return 'Our writers are carefully selected professionals who undergo:\n- Thorough background checks\n- Handwriting style assessment\n- Academic qualification verification\n- Regular quality reviews\nEach writer has their own profile showcasing their style samples and ratings.';
    }

    // Pricing and Payment
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
        lowerMessage.includes('payment')) {
      return 'Our pricing is based on several factors:\n- Number of pages\n- Complexity of content\n- Delivery timeline\nWe offer student discounts and bulk order rates. We accept various payment methods including credit cards and PayPal. Would you like a detailed quote?';
    }

    // Security and Privacy
    if (lowerMessage.includes('security') || lowerMessage.includes('privacy') || 
        lowerMessage.includes('safe')) {
      return 'We take security and privacy seriously:\n- End-to-end encryption for all data\n- Strict confidentiality agreements with writers\n- Secure payment processing\n- No sharing of personal information\n- GDPR compliant data handling';
    }

    // Quality Assurance
    if (lowerMessage.includes('quality') || lowerMessage.includes('guarantee')) {
      return 'Our quality assurance process includes:\n- Multiple review stages\n- Plagiarism checks\n- Style consistency verification\n- Satisfaction guarantee\nIf you\'re not satisfied, we offer revisions and our support team will work with you to ensure your needs are met.';
    }

    // Delivery and Timelines
    if (lowerMessage.includes('time') || lowerMessage.includes('delivery') || 
        lowerMessage.includes('fast')) {
      return 'Our delivery times vary based on the project size:\n- Standard delivery: 2-3 days\n- Express delivery: 24 hours\n- Rush delivery: 12 hours\nWe always aim to deliver before the deadline and keep you updated on the progress.';
    }

    // Student Benefits
    if (lowerMessage.includes('student') || lowerMessage.includes('benefit')) {
      return 'Students enjoy several benefits with Hand2Write:\n- Discounted rates\n- Priority support\n- Multiple revisions\n- Style matching service\n- Bulk order discounts\nAre you interested in learning more about any of these benefits?';
    }

    // Support and Help
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'Our support team is available through multiple channels:\n- 24/7 chat support\n- Email assistance\n- Phone support during business hours\n- Dedicated account managers for bulk orders\nHow can we assist you today?';
    }

    // Registration and Account
    if (lowerMessage.includes('register') || lowerMessage.includes('account') || 
        lowerMessage.includes('sign up')) {
      return 'Creating an account is simple:\n1. Click the "Register" button\n2. Choose your role (Student/Writer)\n3. Provide basic information\n4. Verify your email\n5. Complete your profile\nWould you like me to guide you through the registration process?';
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Welcome to Hand2Write support. I can help you with information about our services, pricing, writers, or any other questions you might have. What would you like to know?';
    }

    // Default response
    return 'I understand you\'re asking about ' + userMessage + '. Could you please provide more details about your question? I\'m here to help with information about our services, pricing, writers, quality assurance, or any other aspects of Hand2Write.';
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      handleAutomatedResponse('Welcome to Hand2Write Support! 👋 I can help you with information about our services. Choose a question below or ask your own!');
      setShowSuggestions(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      setIsTyping(true);
      setTimeout(() => {
        handleAutomatedResponse(getAutomatedResponse(newMessage));
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setNewMessage(question);
    setShowSuggestions(false);
    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      handleAutomatedResponse(getAutomatedResponse(question));
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <span className="text-2xl animate-bounce">💬</span>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl w-96 transform transition-all duration-300 scale-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <h3 className="text-white font-semibold">Hand2Write Support</h3>
            </div>
            <button 
              onClick={toggleChat} 
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="h-96 p-4 overflow-y-auto bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-xl shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white text-gray-800'
                  } transform transition-all duration-200 hover:scale-105`}
                >
                  {message.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                  <div className="text-xs mt-1 opacity-75">{message.timestamp}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-xl bg-white shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            {showSuggestions && messages.length < 3 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 font-medium">Suggested Questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left text-sm p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="border-t p-4 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
