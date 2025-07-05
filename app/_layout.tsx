import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Slot, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { Provider as PaperProvider, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext';
import { chatbot } from '../lib/api/chatbot';
import { ChatContext, ChatMessage, ChatbotResponse } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_MIN_HEIGHT = SCREEN_HEIGHT * 0.3;
const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.9;

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <PaperProvider>
        <InnerApp />
      </PaperProvider>
    </AccessibilityProvider>
  );
}

// Custom component to render formatted guidance text
function FormattedGuidanceText({ text, style }: { text: string; style?: any }) {
  const { theme, settings } = useAccessibility();
  
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: any[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === '') {
        elements.push(<View key={i} style={{ height: 8 }} />);
        continue;
      }
      
      // Title (bold text between **)
      if (line.includes('**') && line.includes('**')) {
        const title = line.replace(/\*\*/g, '').trim();
        elements.push(
          <Text key={i} style={[style, { 
            fontSize: settings.textSize + 2, 
            fontWeight: '700',
            marginBottom: 8,
            color: theme.colors.text
          }]}>
            {title}
          </Text>
        );
        continue;
      }
      
      // Steps (lines starting with numbers and emojis)
      if (line.match(/^\d+️⃣/)) {
        const [stepPart, ...descParts] = line.split('✅');
        const stepNumber = stepPart.trim();
        const description = descParts.join('✅').trim();
        
        elements.push(
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={[style, { 
              fontSize: settings.textSize + 1,
              fontWeight: '600',
              marginRight: 8,
              color: theme.colors.primary,
              minWidth: 32
            }]}>
              {stepNumber}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[style, { 
                fontSize: settings.textSize,
                fontWeight: '600',
                color: theme.colors.text
              }]}>
                {description} ✅
              </Text>
            </View>
          </View>
        );
        continue;
      }
      
      // Sub-steps (lines starting with •)
      if (line.trim().startsWith('•')) {
        const subStep = line.trim().substring(1).trim();
        elements.push(
          <Text key={i} style={[style, { 
            fontSize: settings.textSize - 1,
            color: theme.colors.darkText,
            marginLeft: 24,
            marginBottom: 4,
            lineHeight: (settings.textSize - 1) * 1.3
          }]}>
            • {subStep}
          </Text>
        );
        continue;
      }
      
      // Pro tip (lines starting with 💡)
      if (line.includes('💡')) {
        elements.push(
          <View key={i} style={{
            backgroundColor: theme.colors.primary + '15',
            borderRadius: 8,
            padding: 8,
            marginTop: 8,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.primary
          }}>
            <Text style={[style, { 
              fontSize: settings.textSize - 1,
              color: theme.colors.text,
              fontStyle: 'italic',
              lineHeight: (settings.textSize - 1) * 1.3
            }]}>
              {line}
            </Text>
          </View>
        );
        continue;
      }
      
      // Regular text
      elements.push(
        <Text key={i} style={[style, { 
          fontSize: settings.textSize,
          color: theme.colors.text,
          marginBottom: 4,
          lineHeight: settings.textSize * 1.4
        }]}>
          {line}
        </Text>
      );
    }
    
    return elements;
  };
  
  return (
    <View style={{ flex: 1 }}>
      {renderFormattedText(text)}
    </View>
  );
}

function InnerApp() {
  const router = useRouter();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Modal animation values
  const modalHeight = useRef(new Animated.Value(MODAL_MIN_HEIGHT)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  // Chat scrolling ref
  const chatListRef = useRef<FlatList>(null);
  
  // Fix first launch detection - check AsyncStorage instead of hardcoding
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  // Onboarding wizard state
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [userName, setUserName] = useState<string>('');
  const neuroOptions = ['ADHD', 'Autism', 'Dyslexia'];
  const [neurodiversities, setNeurodiversities] = useState<string[]>([]);
  // Onboarding test mode and answers
  const [testMode, setTestMode] = useState<boolean | null>(null);
  const [testAnswers, setTestAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    options: { text: string; value: string }[];
    next_question_id: number | null;
  } | null>(null);
  // Step 5: detected neurodivergence results for test flow
  const [detectedNeuro, setDetectedNeuro] = useState<string[]>([]);
  // User UUID state
  const [userId, setUserId] = useState<string>('');

  // Load or generate a persistent userId and check first launch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedNeurodiversities = await AsyncStorage.getItem('neurodiversities');
        
        if (hasCompletedOnboarding === 'true') {
          setIsFirstLaunch(false);
          // Load saved user data
          if (storedUserName) setUserName(storedUserName);
          if (storedNeurodiversities) {
            setNeurodiversities(JSON.parse(storedNeurodiversities));
          }
        } else {
          setIsFirstLaunch(true);
        }
        
        // Set up user ID
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          const newId = uuidv4();
          await AsyncStorage.setItem('userId', newId);
          setUserId(newId);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsFirstLaunch(true);
      }
    };

    initializeApp();
  }, []);

  // Improved scroll-to-end function with better layout handling
  const scrollToEndWithDelay = () => {
    if (chatListRef.current) {
      // First scroll attempt - immediate for quick feedback
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Second scroll attempt - for complex messages with follow-up options
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
      // Final scroll attempt - ensure we reach the bottom even for complex layouts
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: false });
      }, 600);
    }
  };

  // Auto-scroll chat to bottom when new messages arrive or typing state changes
  useEffect(() => {
    if ((chatMessages.length > 0 || isTyping)) {
      scrollToEndWithDelay();
    }
  }, [chatMessages, isTyping]);

  // Fetch test question when entering test mode onboarding (step 4)
  useEffect(() => {
    if (onboardingStep === 4 && testMode === true && !currentQuestion && userId) {
      console.log('GET http://34.42.32.87:5000/test/question?user_id=' + userId);
      fetch(`http://34.42.32.87:5000/test/question?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          // Expecting { question, options, next_question_id }
          setCurrentQuestion({
            question: data.question,
            options: data.options,
            next_question_id: data.next_question_id,
          });
        })
        .catch(err => console.error('Error fetching question:', err));
    }
  }, [onboardingStep, testMode, currentQuestion, userId]);

  // Fetch final test results when arriving at Step 5
  useEffect(() => {
    if (onboardingStep === 5 && userId) {
      console.log('GET http://34.42.32.87:5000/test/results/' + userId);
      fetch(`http://34.42.32.87:5000/test/results/${userId}`)
        .then(res => res.json())
        .then(resultData => {
          setDetectedNeuro(resultData.detected || []);
        })
        .catch(err => {
          console.error('Error fetching test results:', err);
        });
    }
  }, [onboardingStep, userId]);

  const {
    settings,
    setTheme,
    setTextSize,
    setReduceMotion,
    setHighContrast,
    setReduceContrast,
    setLargeButtons,
    setScreenReader,
    theme
  } = useAccessibility();

  // Updated chat handling with ADHD chatbot
  const handleSend = async () => {
    if (chatInput.trim() === '') return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      // Create context for the chatbot
      const context: ChatContext = {
        messages: chatMessages,
        userProfile: {
          name: userName,
          preferences: neurodiversities,
          currentMood: undefined
        },
        sessionData: {
          focusSessionActive: false,
          lastMoodCheckIn: undefined,
          recentIntents: []
        }
      };
      
      // Call the ADHD chatbot
      const response: ChatbotResponse = await chatbot(userMessage.content, context);
      
      // Create bot message with follow-up options if available
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.reply,
        sender: 'bot',
        timestamp: new Date(),
        followUpOptions: response.followUpOptions
      };
      
      // Add bot message in single update to prevent multiple scroll triggers
      setChatMessages(prev => [...prev, botMessage]);
      
      // Handle any suggested actions from the chatbot
      if (response.actions && response.actions.length > 0) {
        handleChatbotActions(response.actions);
      }
      
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm here for you. Can you try again in a moment?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle suggestion button clicks
  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion);
    // Optionally auto-send the suggestion
    // handleSend();
  };

  // Handle follow-up option clicks
  const handleFollowUpClick = async (option: any) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `${option.emoji} ${option.text}`,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const context: ChatContext = {
        messages: chatMessages,
        userProfile: {
          name: userName,
          preferences: neurodiversities,
          currentMood: undefined
        },
        sessionData: {
          focusSessionActive: false,
          lastMoodCheckIn: undefined,
          recentIntents: []
        }
      };
      
      // Add specific guidance request to get detailed step-by-step instructions
      const guidanceRequest = `I chose: ${option.text}. Please provide detailed step-by-step guidance for this option.`;
      const response: ChatbotResponse = await chatbot(guidanceRequest, context);
      
      // Debug log to see what we're getting
      console.log('📤 Follow-up response:', response.reply);
      console.log('📝 Is follow-up guidance:', !response.followUpOptions);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.reply || "I'm here to help! Let me know if you need anything else.",
        sender: 'bot',
        timestamp: new Date(),
        followUpOptions: response.followUpOptions // Keep follow-up options for next level
      };
      
      // Add bot message in single update to prevent multiple scroll triggers
      setChatMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Follow-up chatbot error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm here for you. Can you try again in a moment?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Start a new chat session
  const handleNewChat = () => {
    setChatMessages([]);
    setChatInput('');
    setIsTyping(false);
  };

  // Show/hide modal with animation
  const showModal = () => {
    setShowChat(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(modalHeight, {
        toValue: MODAL_MIN_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(modalHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setShowChat(false));
  };

  // Modal size states
  const [modalSize, setModalSize] = useState<'compact' | 'expanded' | 'fullscreen'>('compact');
  
  const cycleModalSize = () => {
    setModalSize(prev => {
      if (prev === 'compact') return 'expanded';
      if (prev === 'expanded') return 'fullscreen';
      return 'compact';
    });
  };

  // Common ADHD support suggestions
  const chatSuggestions = [
    "I'm feeling overwhelmed with my tasks",
    "I can't focus on my work today",
    "I need help breaking down a big project",
    "I'm feeling anxious and stressed",
    "Can you help me with time management?",
    "I'm having trouble getting started"
  ];

  // Handle chatbot suggested actions
  const handleChatbotActions = (actions: string[]) => {
    actions.forEach(action => {
      switch (action) {
        case 'mood_tracking':
          // Could navigate to mood tracking screen
          console.log('Suggested action: mood tracking');
          break;
        case 'start_pomodoro':
          // Could start a focus session
          console.log('Suggested action: start pomodoro');
          break;
        case 'breathing_exercise':
          // Could guide to breathing exercise
          console.log('Suggested action: breathing exercise');
          break;
        case 'break_into_steps':
          // Could help break down tasks
          console.log('Suggested action: break into steps');
          break;
        // Add more action handlers as needed
        default:
          console.log('Unknown action:', action);
      }
    });
  };

  const handleFinishOnboarding = async () => {
    try {
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      await AsyncStorage.setItem('userName', userName);
      await AsyncStorage.setItem('neurodiversities', JSON.stringify(neurodiversities));
      
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null) {
    // You can return a loading indicator here if you want
    return null;
  }

  const styles = StyleSheet.create({
    onboardingContainer: {
      flex: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 30,
      padding: 20    
    },
    onboardingOption: {
      width: '100%',
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.small,
      borderRadius: theme.spacing.small,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
    },
    onboardingOptionSelected: {
      backgroundColor: theme.colors.primary + 'CC',
    },
    onboardingOptionText: {
      color: theme.colors.text,
      fontSize: settings.textSize,
      textAlign: 'center',
    },
    headerSafe: { backgroundColor: theme.colors.primary },
    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
    },
    headerTitle: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      color: theme.colors.text,
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.medium,
      bottom: theme.spacing.large + 80,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: theme.spacing.medium,
      paddingTop: theme.spacing.large,
      position: 'relative',
      zIndex: 10,
    },
    dragBar: {
      width: 60,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignSelf: 'center',
      marginTop: 8,
    },
    modalTitle: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      marginBottom: 12,
      color: theme.colors.text,
    },
    optionsList: {
      paddingVertical: 8,
    },
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    optionLabel: {
      fontSize: settings.textSize,
      color: theme.colors.text,
    },
    modalClose: {
      marginTop: 16,
      alignSelf: 'flex-end',
    },
    modalCloseText: {
      color: theme.colors.primary,
      fontSize: settings.textSize,
      fontWeight: '600',
    },
    chatOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
    },
    chatContainer: {
      height: modalSize === 'fullscreen' ? '95%' : modalSize === 'expanded' ? '80%' : '60%',
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 0,
    },
    chatList: { flex: 1 },
    chatListContent: { paddingVertical: 8 },
    chatBubble: {
      marginVertical: 4,
      marginHorizontal: 8,
      padding: 12,
      borderRadius: 12,
      maxWidth: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    userBubble: {
      backgroundColor: theme.colors.primary + 'CC',
      alignSelf: 'flex-end',
    },
    botBubble: {
      backgroundColor: theme.colors.card + '88',
      alignSelf: 'flex-start',
    },
    chatText: { 
      color: theme.colors.text,
      fontSize: settings.textSize,
      lineHeight: settings.textSize * 1.5,
      flexWrap: 'wrap',
      textAlign: 'left',
    },
    chatInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderColor: '#ccc',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.medium,
      paddingBottom: theme.spacing.large,
      backgroundColor: theme.colors.background,
    },
    chatInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingHorizontal: 12,
      marginRight: 8,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    chatSendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    chatSendText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    chatClose: {
      alignSelf: 'center',
      marginTop: 8,
    },
    chatCloseText: {
      color: theme.colors.primary,
      fontSize: settings.textSize,
    },
    onboardingGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    onboardingTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.large,
    },
    onboardingSubtitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.large,
      paddingHorizontal: theme.spacing.large,
      textAlign: 'center',
    },
    onboardingButton: {
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.spacing.small,
    },
    onboardingButtonText: {
      fontWeight: '600',
      fontSize: theme.spacing.medium,
      color: theme.colors.background,
    },
    onboardingInput: {
      width: '80%',
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.text,
      borderRadius: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      backgroundColor: 'transparent',
      color: theme.colors.text,
      marginBottom: theme.spacing.large,
    },
    chatHeader: {
      paddingTop: theme.spacing.small,
      paddingBottom: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    dragHandleContainer: {
      paddingVertical: theme.spacing.small,
      alignItems: 'center',
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
    },
    chatHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
    },
    chatHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    chatHeaderTextContainer: {
      marginLeft: theme.spacing.small,
      flex: 1,
    },
    chatHeaderText: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      color: theme.colors.text,
    },
    chatHeaderSubtext: {
      fontSize: settings.textSize - 2,
      color: theme.colors.darkText,
      marginTop: 2,
    },
    chatHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    newChatButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chatContent: {
      flex: 1,
    },
    emptyChatContainer: {
      flex: 1,
      padding: theme.spacing.medium,
    },
    welcomeSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
      paddingTop: theme.spacing.large,
    },
    welcomeTitle: {
      fontSize: settings.textSize + 6,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    welcomeText: {
      fontSize: settings.textSize,
      color: theme.colors.darkText,
      textAlign: 'center',
      lineHeight: settings.textSize * 1.4,
    },
    suggestionsContainer: {
      flex: 1,
    },
    suggestionsTitle: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.medium,
    },
    suggestionsScroll: {
      flex: 1,
    },
    suggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.medium,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      marginBottom: theme.spacing.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    suggestionText: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.small,
    },
    userText: {
      color: '#FFFFFF',
    },
    botText: {
      color: theme.colors.text,
    },
    messageTime: {
      fontSize: settings.textSize - 4,
      color: theme.colors.darkText,
      marginTop: theme.spacing.small,
      alignSelf: 'flex-end',
    },
    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 2,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    followUpContainer: {
      marginTop: theme.spacing.medium,
      gap: theme.spacing.small,
      flexWrap: 'wrap',
      flexDirection: 'row',
    },
    followUpButton: {
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 20,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small + 2,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
      marginRight: theme.spacing.small,
      marginBottom: theme.spacing.small,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    followUpText: {
      fontSize: settings.textSize - 1,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    guidanceContainer: {
      backgroundColor: theme.colors.card + '40',
      borderRadius: 12,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    guidanceTitle: {
      fontSize: settings.textSize + 2,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    guidanceStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.small,
    },
    guidanceStepNumber: {
      fontSize: settings.textSize + 1,
      fontWeight: '600',
      color: theme.colors.primary,
      marginRight: theme.spacing.small,
      minWidth: 24,
    },
    guidanceStepText: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      flex: 1,
      lineHeight: settings.textSize * 1.4,
    },
    guidanceSubStep: {
      fontSize: settings.textSize - 1,
      color: theme.colors.darkText,
      marginLeft: theme.spacing.medium,
      marginTop: 2,
      lineHeight: (settings.textSize - 1) * 1.3,
    },
    guidanceProTip: {
      backgroundColor: theme.colors.primary + '15',
      borderRadius: 8,
      padding: theme.spacing.small,
      marginTop: theme.spacing.small,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    guidanceProTipText: {
      fontSize: settings.textSize - 1,
      color: theme.colors.text,
      fontStyle: 'italic',
      lineHeight: (settings.textSize - 1) * 1.3,
    },
  });

  if (isFirstLaunch) {
    // Step 1: Ask Name
    if (onboardingStep === 1) {
      return (
        <>
          <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
          <SafeAreaView
            edges={['top']}
            style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]}
          />
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.background]}
            style={[styles.onboardingContainer, styles.onboardingGradient]}
          >
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 220, height: 120, marginBottom: theme.spacing.large }}
              resizeMode="contain"
            />
            <Text style={styles.onboardingTitle}>Hi! Welcome in Thrive & Boom, we need to ask you some questions to personalize the app and build your profile</Text>
            <Text style={styles.onboardingTitle}>What's your name?</Text>
            <TextInput
              style={styles.onboardingInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity
              onPress={() => userName.trim() && setOnboardingStep(2)}
              style={[styles.onboardingButton, { backgroundColor: theme.colors.primary }]}
              disabled={!userName.trim()}
            >
              <Text style={[styles.onboardingButtonText, { color: theme.colors.background }]}>Next</Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      );
    }
    // Step 2: Know vs Test
    if (onboardingStep === 2 && testMode === null) {
      return (
        <>
          <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
          <SafeAreaView
            edges={['top']}
            style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]}
          />
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.background]}
            style={[styles.onboardingContainer, styles.onboardingGradient]}
          >
            <Text style={styles.onboardingTitle}>Do you already know your neurodiversity?</Text>
            <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: theme.spacing.medium }}>
              {['Yes, I know', 'No, take a test','I haven\'t, just looking around'].map((option, i) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.onboardingOption, { height: 48, justifyContent: 'center', marginBottom: theme.spacing.large }]}
                  onPress={() => {
                    if (i === 0) {
                      // User knows neurodiversity: go to manual selection
                      setTestMode(false);
                      setOnboardingStep(3);
                    } else if (i === 1) {
                      // User wants to take the test: go to test questions
                      setTestMode(true);
                      setOnboardingStep(4);
                    } else {
                      // User is just browsing: finish onboarding
                      handleFinishOnboarding();
                    }
                  }}
                >
                  <Text style={styles.onboardingOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.primary }} />
          </LinearGradient>
        </>
      );
    }
    // Step 3: Manual neurodiversity selection if user knows
    if (onboardingStep === 3 && testMode === false) {
      return (
        <>
          <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
          <SafeAreaView edges={['top']} style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]} />
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.background]}
            style={[styles.onboardingContainer, styles.onboardingGradient]}
          >
            <Text style={styles.onboardingTitle}>Select your neurodiversity</Text>
            <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: theme.spacing.medium }}>
              {neuroOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setNeurodiversities(prev =>
                      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
                    );
                  }}
                  style={[
                    styles.onboardingOption,
                    neurodiversities.includes(option) && styles.onboardingOptionSelected,
                    { height: 60, justifyContent: 'center' }
                  ]}
                >
                  <Text style={styles.onboardingOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={neurodiversities.length > 0 ? handleFinishOnboarding : undefined}
              style={[styles.onboardingButton, { backgroundColor: theme.colors.primary }]}
              disabled={neurodiversities.length === 0}
            >
              <Text style={[styles.onboardingButtonText, { color: theme.colors.background }]}>Finish</Text>
            </TouchableOpacity>
          </LinearGradient>
        </>
      );
    }
    // Step 4: Dynamic Test if user chose to take a test
    if (onboardingStep === 4 && testMode === true) {
      if (!currentQuestion || !userId) {
        return (
          <>
            <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
            <SafeAreaView edges={['top']} style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]} />
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.background]}
              style={[styles.onboardingContainer, styles.onboardingGradient]}
            >
              <ActivityIndicator size="large" color={theme.colors.background} />
            </LinearGradient>
          </>
        );
      }
      const q = currentQuestion;
      return (
        <>
          <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
          <SafeAreaView edges={['top']} style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]} />
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.background]}
            style={[styles.onboardingContainer, styles.onboardingGradient]}
          >
            <Text style={styles.onboardingTitle}>{q?.question}</Text>
            <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
              {q?.options.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.onboardingOption, { height: 48, justifyContent: 'center', marginBottom: theme.spacing.large }]}
                  onPress={() => {
                    setTestAnswers(prev => ({ ...prev, [q.question]: opt.value }));
                    // Send answer to endpoint and fetch next question
                    fetch(`http://34.42.32.87:5000/test/answer?user_id=${userId}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ answer: opt.value }),
                    })
                      .then(res => res.json())
                      .then(data => {
                        if (data.next_question_id) {
                          setCurrentQuestion(data);
                        } else {
                          // No more questions: submit all answers
                          console.log('POST http://34.42.32.87:5000/test/answer?user_id=' + userId, 'body:', testAnswers);
                          fetch(`http://34.42.32.87:5000/test/answer?user_id=${userId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, answers: testAnswers }),
                          })
                            .then(() => {
                              setOnboardingStep(5);
                            })
                            .catch(err => {
                              console.error('Error submitting test answers:', err);
                              setOnboardingStep(5);
                            });
                        }
                      })
                      .catch(err => console.error('Error posting answer:', err));
                  }}
                >
                  <Text style={styles.onboardingOptionText}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.primary }} />
          </LinearGradient>
        </>
      );
    }
    // Step 5: Test Result
    if (onboardingStep === 5) {
      return (
        <>
          <StatusBar style="light" translucent backgroundColor={theme.colors.primary} />
          <SafeAreaView edges={['top']} style={[{ backgroundColor: theme.colors.primary }, styles.onboardingContainer]} />
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.background]}
            style={[styles.onboardingContainer, styles.onboardingGradient]}
          >
            <Text style={styles.onboardingTitle}>Test Complete!</Text>
            <Text style={[styles.onboardingSubtitle, { marginBottom: theme.spacing.large }]}>
              Based on your answers, we've detected:
            </Text>
            {detectedNeuro.map(item => (
              <Text
                key={item}
                style={[styles.onboardingOptionText, { fontSize: settings.textSize + 2, marginBottom: theme.spacing.small }]}
              >
                • {item}
              </Text>
            ))}
            <TouchableOpacity
              onPress={handleFinishOnboarding}
              style={[styles.onboardingButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={[styles.onboardingButtonText, { color: theme.colors.background }]}>Finish</Text>
            </TouchableOpacity>
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.primary }} />
          </LinearGradient>
        </>
      );
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAccessibility(true)}>
            <Ionicons name="accessibility-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thrive & Bloom</Text>
          <TouchableOpacity onPress={() => router.push('/community/profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <Slot />

      {/* Chat FAB */}
      <Portal>
        <TouchableOpacity
          style={styles.fab}
          onPress={showModal}
          accessibilityLabel="Open AI Chat"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Portal>

      {/* Accessibility Modal */}
      <Modal
        visible={showAccessibility}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccessibility(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Drag indicator */}
            <View style={styles.dragBar} />
            <Text style={styles.modalTitle}>Accessibility Options</Text>
            <ScrollView contentContainerStyle={styles.optionsList}>
              {/* Dark Theme */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Dark Theme</Text>
                <Switch
                  value={settings.theme === 'dark'}
                  onValueChange={v => setTheme(v ? 'dark' : 'light')}
                />
              </View>
              {/* Reduce Motion */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Reduce Motion</Text>
                <Switch
                  value={settings.reduceMotion}
                  onValueChange={v => setReduceMotion(v)}
                />
              </View>
              {/* High Contrast */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>High Contrast</Text>
                <Switch
                  value={settings.highContrast}
                  onValueChange={v => setHighContrast(v)}
                />
              </View>
              {/* Reduce Contrast */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Reduce Contrast</Text>
                <Switch
                  value={settings.reduceContrast}
                  onValueChange={v => setReduceContrast(v)}
                />
              </View>
              {/* Large Buttons */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Large Buttons</Text>
                <Switch
                  value={settings.largeButtons}
                  onValueChange={v => setLargeButtons(v)}
                />
              </View>
              {/* Screen Reader */}
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Screen Reader</Text>
                <Switch
                  value={settings.screenReader}
                  onValueChange={v => setScreenReader(v)}
                />
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowAccessibility(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Chat Modal */}
      <Modal
        visible={showChat}
        transparent
        animationType="slide"
        onRequestClose={hideModal}
      >
        <TouchableOpacity 
          style={styles.chatOverlay} 
          activeOpacity={1} 
          onPress={hideModal}
        >
          <TouchableOpacity 
            style={styles.chatContainer} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Chat Header with Drag Indicator */}
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={cycleModalSize} style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </TouchableOpacity>
              <View style={styles.chatHeaderContent}>
                <View style={styles.chatHeaderLeft}>
                  <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
                  <View style={styles.chatHeaderTextContainer}>
                    <Text style={styles.chatHeaderText}>ADHD Support AI</Text>
                    <Text style={styles.chatHeaderSubtext}>Here to help with focus, tasks, and well-being</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                  <Ionicons name="add-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat Content */}
            <View style={styles.chatContent}>
              {chatMessages.length === 0 ? (
                /* Empty State with Suggestions */
                <View style={styles.emptyChatContainer}>
                  <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>👋 Hi there!</Text>
                    <Text style={styles.welcomeText}>
                      I'm here to help you with ADHD support, focus, and well-being. 
                      Choose a topic below to get started or type your own message.
                    </Text>
                  </View>
                  
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
                    <ScrollView style={styles.suggestionsScroll} showsVerticalScrollIndicator={false}>
                      {chatSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionButton}
                          onPress={() => handleSuggestionClick(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                          <Ionicons name="arrow-forward-outline" size={16} color={theme.colors.primary} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              ) : (
                /* Chat Messages */
                <FlatList
                  ref={chatListRef}
                  data={[...chatMessages, ...(isTyping ? [{ id: 'typing', content: 'AI is typing...', sender: 'bot', timestamp: new Date(), isTyping: true }] : [])]}
                  keyExtractor={item => item.id}
                  style={styles.chatList}
                  contentContainerStyle={styles.chatListContent}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={false}
                  onLayout={scrollToEndWithDelay}
                  renderItem={({ item }) => {
                    // Handle typing indicator
                    if (item.isTyping) {
                      return (
                        <View style={[styles.chatBubble, styles.botBubble, styles.typingBubble]}>
                          <Text style={[styles.chatText, styles.botText]}>AI is typing...</Text>
                          <View style={styles.typingIndicator}>
                            <View style={styles.typingDot} />
                            <View style={styles.typingDot} />
                            <View style={styles.typingDot} />
                          </View>
                        </View>
                      );
                    }
                    
                    const isDetailedGuidance = item.content.includes('**') && item.content.includes('✅');
                    
                    return (
                      <View style={[
                        styles.chatBubble,
                        item.sender === 'user' ? styles.userBubble : styles.botBubble
                      ]}>
                        {isDetailedGuidance ? (
                          <FormattedGuidanceText 
                            text={item.content}
                            style={[
                              styles.chatText,
                              item.sender === 'user' ? styles.userText : styles.botText
                            ]}
                          />
                        ) : (
                          <Text style={[
                            styles.chatText,
                            item.sender === 'user' ? styles.userText : styles.botText
                          ]}>
                            {item.content}
                          </Text>
                        )}
                        {item.followUpOptions && item.followUpOptions.length > 0 && (
                          <View style={styles.followUpContainer}>
                            {item.followUpOptions.map((option: any, index: number) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.followUpButton}
                                onPress={() => handleFollowUpClick(option)}
                              >
                                <Text style={styles.followUpText}>
                                  {option.emoji} {option.text}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        <Text style={styles.messageTime}>
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    );
                  }}
                />
               )}
            </View>
            
            {/* Input area */}
            <View style={styles.chatInputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type your message here..."
                  placeholderTextColor={theme.colors.darkText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  onPress={handleSend} 
                  style={[
                    styles.chatSendButton,
                    { opacity: isTyping ? 0.7 : 1 }
                  ]}
                  disabled={isTyping}
                >
                  <Ionicons 
                    name="send" 
                    size={22} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
