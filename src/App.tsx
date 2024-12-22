import React from 'react';
import ChatComponent from './components/ChatComponent';
import { Box, Container, createTheme, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import './App.css';


const theme = createTheme({
    palette: {
        background: {
            default: '#f0f4f8',
        },

    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },

});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Container maxWidth="md" sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '20px',
                boxSizing: 'border-box',


            }}>
                <Box sx={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    padding: '20px',
                    textAlign: 'center',

                }}
                >
                    <Typography variant="h4" component="h1" sx={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '2rem',
                        color: '#333',
                        marginBottom: '20px',
                    }}>
                        KISS AI Stack, Chatbot demo
                    </Typography>
                    <ChatComponent/>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App;