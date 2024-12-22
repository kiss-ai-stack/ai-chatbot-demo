import React, { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { animated, useSpring, useTransition } from 'react-spring';
import ChatService from '../services/ChatService';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Avatar from '@mui/material/Avatar';
import Slide from '@mui/material/Slide';
import PersonIcon from '@mui/icons-material/Person';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const chatService = new ChatService('localhost:8080', false);

// MUI v5 Theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#008600',
        },
        grey: {
            100: '#F5F5F5',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        divider: '#e0e0e0',
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    marginRight: '4px',
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 1
            },
            styleOverrides: {
                root: {
                    marginBottom: "2px",
                    padding: "5px"
                }
            },
        },
    },
});

interface Message {
    sender: 'user' | 'bot';
    text: string;
    id?: number;
    loading?: boolean;
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [botIsLoading, setBotIsLoading] = useState(false)
    const [isChatActive, setIsChatActive] = useState<boolean>(false);
    const chatListRef = useRef<HTMLUListElement>(null);


    // Unique identifier
    const messageCounter = useRef(0);


    const handleScroll = () => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (isChatActive && chatListRef.current) {
            setTimeout(() => {
                handleScroll();
            }, 150);
        }
    }, [isChatActive, messages]);


    const handleJoinChat = async () => {
        setIsLoading(true);
        setMessages([]); // reset
        try {
            await chatService.authorizeStack(undefined, undefined, 'temporary');
            const response = await chatService.bootstrapStack('Hi');
            if (response?.answer) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: messageCounter.current++,
                        sender: 'bot',
                        text: response.answer,
                    },
                ]);
            }

            setIsChatActive(true);

        } catch (error) {
            console.error('Error joining chat', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: messageCounter.current++,
                    sender: 'bot',
                    text: 'Error joining chat. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }

    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        const message: Message = { id: messageCounter.current++, sender: 'user', text: newMessage };
        setMessages((prev) => [...prev, message]);
        setNewMessage('');


        setBotIsLoading(true); //set loadin state


        const newBotMessage: Message  = { id: messageCounter.current++, sender: 'bot', text: "", loading: true}
        setMessages((prev) => [...prev, newBotMessage ]); // Loading message to trigger state animation

        try {
            const response = await chatService.generateAnswer(newMessage);
            setBotIsLoading(false) // end loading indicator after API
            setMessages(prev => {
                const findIndexLoading = prev.findIndex((element) => element.loading); // finding the last "loading..."

                if (findIndexLoading === -1) return [...prev];
                const messageUpdate: Message[] = [...prev];
                messageUpdate[findIndexLoading] = {...messageUpdate[findIndexLoading], loading:false, text:response?.answer}  // using safe optional chaining
                return messageUpdate;
            } );



        } catch (error) {
            console.error('Error generating answer', error);
            setBotIsLoading(false);  // stop loading state on fail
            setMessages(prev => {
                const findIndexLoading = prev.findIndex((element) => element.loading); //  search last loading... element for replacement
                if (findIndexLoading === -1) return [...prev]
                const messageUpdate: Message[] = [...prev];
                messageUpdate[findIndexLoading] =  {...messageUpdate[findIndexLoading], loading: false, text: "Error, please try again."}
                return messageUpdate;
            });


        }

    };
    const handleDestroyChat = async () => {
        try {
            await chatService.destroyStack('Bye');
            setIsChatActive(false);
            setMessages([]);
            messageCounter.current = 0;
        } catch (error) {
            console.error('Error destroying chat', error);
        }
    };


    const messageTransitions = useTransition(messages, {
        keys: (message) => message.id,
        from: {opacity: 0, transform: 'translateY(20px)'},
        enter: {opacity: 1, transform: 'translateY(0px)'},
        leave: {opacity: 0, transform: 'translateY(20px)'},
    });

    const joinChatTransition = useSpring({
        opacity: isChatActive ? 1 : 0,
        transform: isChatActive ? 'translateY(0)' : 'translateY(-20px)',
        config: {tension: 170, friction: 26},
    });

    const fadeButtonStyle = useSpring({
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? 'none' : 'auto'
    });
    // Loading Dots Component
    const LoadingDots = () => {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '0px 20px 20px 20px',
                backgroundColor: theme?.palette?.grey?.[100] || '#eeeeee',
                color: theme?.palette?.text?.primary || '#000000',
                marginTop: 0,
                marginRight: '20%',
            }}>
                <Box sx={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: theme?.palette?.text?.primary || '#000000',
                    borderRadius: '50%',
                    margin: '0 3px',
                    display: 'inline-block',
                    animation: 'pulse 1.2s infinite linear',
                    '&:nth-child(2)': {animationDelay: '0.4s'},
                    '&:nth-child(3)': {animationDelay: '0.8s'},

                    '@keyframes pulse': {
                        '0%': {transform: 'scale(0.4)', opacity: '0.8'},
                        '50%': {transform: 'scale(1.4)', opacity: '0.2'},
                        '100%': {transform: 'scale(0.4)', opacity: '0.8'},
                    }


                }}/>
                <Box sx={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: theme?.palette?.text?.primary || '#000000',
                    borderRadius: '50%',
                    margin: '0 3px',
                    display: 'inline-block',
                    animation: 'pulse 1.2s infinite linear',
                    '&:nth-child(2)': {animationDelay: '0.4s'},
                    '&:nth-child(3)': {animationDelay: '0.8s'},


                    '@keyframes pulse': {
                        '0%': {transform: 'scale(0.4)', opacity: '0.8'},
                        '50%': {transform: 'scale(1.4)', opacity: '0.2'},
                        '100%': {transform: 'scale(0.4)', opacity: '0.8'},
                    }

                }}/>
                <Box sx={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: theme?.palette?.text?.primary || '#000000',
                    borderRadius: '50%',
                    margin: '0 3px',
                    display: 'inline-block',
                    animation: 'pulse 1.2s infinite linear',

                    '&:nth-child(2)': {animationDelay: '0.4s'},
                    '&:nth-child(3)': {animationDelay: '0.8s'},


                    '@keyframes pulse': {
                        '0%': {transform: 'scale(0.4)', opacity: '0.8'},
                        '50%': {transform: 'scale(1.4)', opacity: '0.2'},
                        '100%': {transform: 'scale(0.4)', opacity: '0.8'},
                    }

                }}/>

            </Box>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80vh',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
            >
                {!isChatActive ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                        }}
                    >
                        {isLoading ? <CircularProgress/> :
                            <animated.div style={fadeButtonStyle}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleJoinChat}
                                >
                                    Join Chat
                                </Button>
                            </animated.div>
                        }
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: (theme) => theme.spacing(2),
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.grey[100],

                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Avatar><PersonIcon/></Avatar>
                                <Typography variant="h6">AI Assistant</Typography>
                            </Box>
                            <Tooltip title="Settings" arrow>
                                <IconButton> <SettingsSuggestIcon/></IconButton>
                            </Tooltip>
                        </Box>

                        <animated.div style={joinChatTransition}>
                            <List
                                sx={{
                                    overflowY: 'auto',
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    paddingX: 2,
                                    gap: 1,
                                }}

                                ref={chatListRef}
                            >
                                {messageTransitions((styles, message, transition) => {

                                    return (
                                        <Slide key={message.id} direction="left" in={true}>
                                            <ListItem
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        message.sender === 'user' ? 'flex-end' : 'flex-start',
                                                    paddingY: 0,
                                                }}
                                            >
                                                {message.sender === 'user' ? (
                                                    <Paper
                                                        sx={{
                                                            backgroundColor: (theme) => theme?.palette?.primary?.main || '#008600',
                                                            color: '#ffffff',
                                                            padding: '10px 14px',
                                                            borderRadius: '20px 0px 20px 20px', // Tailored radius for bubble effect
                                                            maxWidth: '70%', // Allow longer messages
                                                            alignSelf: 'flex-end',
                                                            marginLeft: '20%',
                                                            display: 'inline-block', // Fixes message width,
                                                            marginTop: 0,

                                                        }}>
                                                        {message.text}
                                                    </Paper>
                                                ) : (

                                                    message.loading ? <LoadingDots/>
                                                        : <Paper sx={{
                                                            backgroundColor: (theme) =>
                                                                theme?.palette?.grey?.[100] || '#eeeeee',
                                                            color: (theme) =>
                                                                theme?.palette?.text?.primary || '#000000',
                                                            padding: '10px 14px',
                                                            borderRadius: '0px 20px 20px 20px',
                                                            maxWidth: '70%',
                                                            alignSelf: 'flex-start',
                                                            marginRight: '20%',
                                                            marginTop: 0,
                                                            display: 'inline-block',
                                                        }}>
                                                            {message.text}

                                                        </Paper>


                                                )}
                                            </ListItem>
                                        </Slide>
                                    );
                                })}

                            </List>
                        </animated.div>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: '8px',
                                padding: 2,
                                borderTop: `1px solid ${theme.palette.divider}`,

                            }}
                        >
                            <TextField
                                fullWidth
                                label="Type a message"
                                variant="outlined"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button variant="contained" onClick={handleSendMessage}><SendIcon/></Button>
                            <Button variant="contained" color="error"
                                    onClick={handleDestroyChat}><ExitToAppIcon/></Button>
                        </Box>
                    </>

                )}
            </Box>
        </ThemeProvider>
    );
};

export default ChatComponent;