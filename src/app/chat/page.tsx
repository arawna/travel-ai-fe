"use client"
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import authService from '@/services/authService'
import styles from './chat.module.css'
import UserIcon from '@/components/icons/UserIcon'
import LanguageIcon from '@/components/icons/LanguageIcon'
import Link from 'next/link'
import ChatGptIcon from '@/components/icons/ChatGptIcon'
import { Container, Grid2, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFormik } from 'formik'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import chatService from '@/services/chatService'

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // Form validation schema
  const validationSchema = Yup.object({
    from: Yup.string()
      .required('From is required')
      .min(2, 'From must be at least 2 characters'),
    destination: Yup.string()
      .required('Destination is required')
      .min(2, 'Destination must be at least 2 characters'),
    startDate: Yup.date()
      .required('Start date is required')
      .min(dayjs().subtract(1, 'day').toDate(), 'Start date cannot be in the past'),
    endDate: Yup.date()
      .required('End date is required')
      .min(
        Yup.ref('startDate'),
        'End date must be after start date'
      )
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      from: '',
      destination: '',
      startDate: null,
      endDate: null
    },
    validationSchema,
    onSubmit: (values) => {
      handleSearch(values)
    }
  });

  const handleSearch = (values: any) => {
    setIsLoading(true)
    let data = {
      from: values.from,
      destination: values.destination,
      // @ts-ignore
      startDate: values.startDate.format("YYYY-MM-DD"),
      // @ts-ignore
      endDate: values.endDate.format("YYYY-MM-DD")
    }
    let newChatHistory = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an AI travel planner  you will plan the user's trip by:\n\nProviding estimated average flight prices.\nSuggesting transportation options from the airport to the city center, including estimated costs.\nRecommending accommodation options with average prices.\nCreating a detailed itinerary with a daily and hourly schedule of places to visit within the given travel dates."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `From: ${data.from} To: ${data.destination} StartDate: ${data.startDate} EndDate: ${data.endDate}`
          }
        ]
      }
    ];
    chatService.sendMessage(newChatHistory).then((res) => {
      setChatHistory([...newChatHistory, res.data])
      setIsLoading(false)
    })
  }


  useLayoutEffect(() => {
    const paramsToken = searchParams.get('token');
    if (paramsToken) {
      localStorage.setItem('token', paramsToken);
      authService.verifyToken().then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      }).catch((error) => {
      });
    }

    const token = localStorage.getItem('token');
    if (token) {
      authService.verifyToken().then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }).catch((error) => {
      });
    } else {
      router.push("/login")
    }
  }, [searchParams]);

  // Dil menüsü dışında bir yere tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    // Belge üzerindeki tıklamaları dinle
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Temizlik işlemi
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageMenuRef, userMenuRef]);

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
    setShowUserMenu(false); // Diğer menüyü kapat
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowLanguageMenu(false); // Diğer menüyü kapat
  };

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    setShowLanguageMenu(false);
    // Burada dil değiştirme mantığı eklenebilir
    console.log(`Language changed to: ${language}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const [message, setMessage] = useState('');
  const hanndleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true)
    let newChatHistory = [
      ...chatHistory,
      {
        role: "user",
        content: [
          { type: "text", text: message }
        ]
      }
    ]
    chatService.sendMessage(newChatHistory).then((res) => {
      setChatHistory([...newChatHistory, res.data])
      setIsLoading(false)
    })
  }

  return (
    <div className={styles.backgroundWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link href="/chat" className={styles.logo}>
            TRAVEL AI
          </Link>
          <div className={styles.navbarRight}>
            <div className={styles.languageSelector} ref={languageMenuRef}>
              <div
                className={styles.iconButton}
                onClick={toggleLanguageMenu}
                title="Change language"
              >
                <LanguageIcon />
              </div>
              {showLanguageMenu && (
                <div className={styles.languageMenu}>
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'English' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('English')}
                  >
                    English
                  </div>
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'Türkçe' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('Türkçe')}
                  >
                    Türkçe
                  </div>
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'Español' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('Español')}
                  >
                    Español
                  </div>
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'Français' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('Français')}
                  >
                    Français
                  </div>
                </div>
              )}
            </div>
            <div className={styles.userSelector} ref={userMenuRef}>
              <div
                className={styles.iconButton}
                onClick={toggleUserMenu}
                title="User menu"
              >
                <UserIcon />
              </div>
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userMenuName}>
                      {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').name : 'User'}
                    </div>
                    <div className={styles.userMenuEmail}>
                      {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : 'user@example.com'}
                    </div>
                  </div>
                  <div className={styles.userMenuDivider}></div>
                  {/* <div className={styles.userMenuOption} onClick={() => router.push('/profile')}>
                    Profile
                  </div>
                  <div className={styles.userMenuOption} onClick={() => router.push('/settings')}>
                    Settings
                  </div>
                  <div className={styles.userMenuDivider}></div> */}
                  <div className={styles.userMenuOption} onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className={styles.chatGptIconContainer}>
        <ChatGptIcon />
        <span className={styles.chatGptIconText}>ChatGPT</span>
        <span className={styles.chatGptPlus}>Plus</span>
      </div>
      <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', opacity: ".95" }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <TextField
                  style={{ width: "100%" }}
                  id="from"
                  name="from"
                  label="From"
                  variant="outlined"
                  value={formik.values.from}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.from && Boolean(formik.errors.from)}
                  helperText={formik.touched.from && formik.errors.from}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <TextField
                  style={{ width: "100%" }}
                  id="destination"
                  name="destination"
                  label="Where do you want to go?"
                  variant="outlined"
                  value={formik.values.destination}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.destination && Boolean(formik.errors.destination)}
                  helperText={formik.touched.destination && formik.errors.destination}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: "100%" }}
                    label="Start Date"
                    value={formik.values.startDate}
                    onChange={(date) => formik.setFieldValue('startDate', date)}
                    onClose={() => formik.setFieldTouched('startDate', true)}
                    slotProps={{
                      textField: {
                        error: formik.touched.startDate && Boolean(formik.errors.startDate),
                        helperText: formik.touched.startDate && formik.errors.startDate as string
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: "100%" }}
                    label="End Date"
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue('endDate', date)}
                    onClose={() => formik.setFieldTouched('endDate', true)}
                    slotProps={{
                      textField: {
                        error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        helperText: formik.touched.endDate && formik.errors.endDate as string
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
            </Grid2>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#8F55FF",
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                padding: "10px 60px",
                borderRadius: "15px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Plan Your Trip
            </button>
          </div>
        </form>
      </Container>

      <div>
        <Container maxWidth="lg" style={{ padding: "20px" }}>
          <div style={{
            background: "white",
            borderRadius: "15px",
            height: "500px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: ".96"
          }}>
            <div className={styles.chatScrollContainer}>
              <div className={styles.chatContainer}>
                {chatHistory.map((message, index) => index > 1 && (
                  <div
                    key={index}
                    className={`${styles.messageWrapper} ${message.role === 'user' ? styles.userMessage : styles.systemMessage}`}
                  >
                    <div className={styles.messageBubble}>
                      {message.content.map((content: any, contentIndex: number) => (
                        <div key={contentIndex}>
                          {content.type === 'text' && content.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.messageWrapper} ${styles.systemMessage}`}>
                    <div className={styles.messageBubble}>
                      <div className={styles.typingIndicator}>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={hanndleSendMessage}>
              <div className={styles.messageInputContainer}>
                <textarea
                  className={styles.messageInput}
                  placeholder="Type your message here..."
                  rows={2}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />
                <button disabled={isLoading} type="submit" className={styles.sendButton}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </Container>
      </div>
    </div>
  )
}
