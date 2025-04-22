"use client"
import React, { useEffect, useState, useRef, useLayoutEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import authService from '@/services/authService'
import styles from './chat.module.css'
import UserIcon from '@/components/icons/UserIcon'
import LanguageIcon from '@/components/icons/LanguageIcon'
import Link from 'next/link'
import ChatGptIcon from '@/components/icons/ChatGptIcon'
import { Autocomplete, Container, Grid2, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFormik } from 'formik'
import debounce from 'lodash/debounce';
import * as Yup from 'yup'
import dayjs from 'dayjs'
import chatService from '@/services/chatService'
import englishTranslations from '@/app/i18n/english.json';
import turkishTranslations from '@/app/i18n/turkish.json';
import spanishTranslations from '@/app/i18n/spanish.json';
import frenchTranslations from '@/app/i18n/french.json';
import italianTranslations from '@/app/i18n/italian.json';
import germanTranslations from '@/app/i18n/german.json';
import 'dayjs/locale/tr' // Türkçe desteği için
import 'dayjs/locale/es' // Spanish support
import 'dayjs/locale/fr' // French support
import 'dayjs/locale/it' // Italian support
import 'dayjs/locale/de' // German support
import updateLocale from 'dayjs/plugin/updateLocale' // Locale güncelleme eklentisi

// dayjs plugins ve locale ayarları
dayjs.extend(updateLocale)
// Varsayılan olarak İngilizce kullan, dil değişikliğinde güncellenecek
dayjs.locale('en')

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);

  const handleClickPlanAgain = () => {
    setIsPlanned(false)
    setChatHistory([])
    formik.setValues({
      from: '',
      destination: '',
      startDate: null,
      endDate: null,
      keyWords: [],
      initialMessage: ''
    })
  }
  
  // Başlangıçta localStorage'dan dil seçimini al veya varsayılan olarak English kullan
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLanguage') || 'English';
    }
    return 'English';
  });

  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [translations, setTranslations] = useState(englishTranslations);

  // Form validation schema'yı useEffect içinde oluşturalım
  const [validationSchema, setValidationSchema] = useState(
    Yup.object({
      from: Yup.string()
        .required(translations.validation.from.required)
        .min(2, translations.validation.from.min),
      destination: Yup.string()
        .required(translations.validation.destination.required)
        .min(2, translations.validation.destination.min),
      startDate: Yup.date()
        .required(translations.validation.startDate.required)
        .min(dayjs().subtract(1, 'day').toDate(), translations.validation.startDate.past),
      endDate: Yup.date()
        .required(translations.validation.endDate.required)
        .min(
          Yup.ref('startDate'),
          translations.validation.endDate.afterStart
        ),
      keyWords: Yup.array()
        .min(1, translations.validation.keyWords.min)
        .max(3, translations.validation.keyWords.max)
        .required(translations.validation.keyWords.required)
    })
  );

  // Dil değiştiğinde validation schema'yı güncelle
  useEffect(() => {
    setValidationSchema(
      Yup.object({
        from: Yup.string()
          .required(translations.validation.from.required)
          .min(2, translations.validation.from.min),
        destination: Yup.string()
          .required(translations.validation.destination.required)
          .min(2, translations.validation.destination.min),
        startDate: Yup.date()
          .required(translations.validation.startDate.required)
          .min(dayjs().subtract(1, 'day').toDate(), translations.validation.startDate.past),
        endDate: Yup.date()
          .required(translations.validation.endDate.required)
          .min(
            Yup.ref('startDate'),
            translations.validation.endDate.afterStart
          ),
        keyWords: Yup.array()
          .min(1, translations.validation.keyWords.min)
          .max(3, translations.validation.keyWords.max)
          .required(translations.validation.keyWords.required)
      })
    );
  }, [translations]);

  // Formik setup'ı güncelle
  const formik = useFormik({
    initialValues: {
      from: '',
      destination: '',
      startDate: null,
      endDate: null,
      keyWords: [],
      initialMessage: ''
    },
    validationSchema, // artık dinamik schema'yı kullan
    enableReinitialize: true, // validation mesajları değiştiğinde yeniden başlatılmasını sağlar
    onSubmit: (values) => {
      handleSearch(values)
    }
  });

  const handleSearch = (values: any) => {
    setIsPlanned(true)
    setIsLoading(true)
    let data = {
      from: values.from,
      destination: values.destination,
      // @ts-ignore
      startDate: values.startDate.format("YYYY-MM-DD"),
      // @ts-ignore
      endDate: values.endDate.format("YYYY-MM-DD"),
      keyWords: values.keyWords,
      initialMessage: values.initialMessage
    }
    
    let messageText = `From: ${data.from} To: ${data.destination} StartDate: ${data.startDate} EndDate: ${data.endDate} Keywords: ${data.keyWords.join(', ')} ResponseLanguage: ${currentLanguage}`;
    
    // Add the initial message if it exists
    if (data.initialMessage) {
      messageText += `\n\nAdditional Information: ${data.initialMessage}`;
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
            text: messageText
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
    switch(language) {
      case 'English':
        setTranslations(englishTranslations);
        dayjs.locale('en');
        break;
      case 'Türkçe':
        setTranslations(turkishTranslations);
        dayjs.locale('tr');
        break;
      case 'Español':
        setTranslations(spanishTranslations);
        dayjs.locale('es');
        break;
      case 'Français':
        setTranslations(frenchTranslations);
        dayjs.locale('fr');
        break;
      case 'Italiano':
        setTranslations(italianTranslations);
        dayjs.locale('it');
        break;
      case 'Deutsch':
        setTranslations(germanTranslations);
        dayjs.locale('de');
        break;
      default:
        setTranslations(englishTranslations);
        dayjs.locale('en');
    }
    localStorage.setItem('selectedLanguage', language);
    setShowLanguageMenu(false);
  };

  // İlk yüklemede dil ayarını yap
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      switch(savedLanguage) {
        case 'English':
          setTranslations(englishTranslations);
          dayjs.locale('en');
          break;
        case 'Türkçe':
          setTranslations(turkishTranslations);
          dayjs.locale('tr');
          break;
        case 'Español':
          setTranslations(spanishTranslations);
          dayjs.locale('es');
          break;
        case 'Français':
          setTranslations(frenchTranslations);
          dayjs.locale('fr');
          break;
        case 'Italiano':
          setTranslations(italianTranslations);
          dayjs.locale('it');
          break;
        case 'Deutsch':
          setTranslations(germanTranslations);
          dayjs.locale('de');
          break;
        default:
          setTranslations(englishTranslations);
          dayjs.locale('en');
      }
    }
  }, []);

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
    setChatHistory([...newChatHistory])
    chatService.sendMessage(newChatHistory).then((res) => {
      setChatHistory([...newChatHistory, res.data])
      setIsLoading(false)
    })
  }

  const [fromOptions, setFromOptions] = useState<string[]>([]);
  const searchFrom = useCallback(debounce((input:string) => {
    chatService.search(input).then((res) => {
      setFromOptions(res.data.data)
    })
  }, 1000), [])
  const hacdleChangeFrom = (e:any) => {
    formik.handleChange(e)
    if (e.target.value.length > 2) {
      searchFrom(e.target.value)
    }
  }

  const [toOptions, setToOptions] = useState<string[]>([]);
  const searchTo = useCallback(debounce((input:string) => {
    chatService.search(input).then((res) => {
      setToOptions(res.data.data)
    })
  }, 1000), [])
  const handleChangeTo = (e:any) => {
    formik.handleChange(e)
    if (e.target.value.length > 2) {
      searchTo(e.target.value)
    }
  }

  const [keyWords, setKeyWords] = useState<string[]>(() => {
    // Set initial keywords based on current language
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        switch(savedLanguage) {
          case 'English': return englishTranslations.form.keyWordOptions;
          case 'Türkçe': return turkishTranslations.form.keyWordOptions;
          case 'Español': return spanishTranslations.form.keyWordOptions;
          case 'Français': return frenchTranslations.form.keyWordOptions;
          case 'Italiano': return italianTranslations.form.keyWordOptions;
          case 'Deutsch': return germanTranslations.form.keyWordOptions;
          default: return englishTranslations.form.keyWordOptions;
        }
      }
    }
    // Default to English
    return englishTranslations.form.keyWordOptions;
  });
  
  // Update keywords when language changes
  useEffect(() => {
    // Set keywords based on selected language
    setKeyWords(translations.form.keyWordOptions || []);
  }, [translations]);

  const formatMessage = (text: string) => {
    // Split into sections by triple dashes
    const sections = text.split('---').map(section => section.trim());
    
    const processBoldText = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      });
    };

    return (
      <div className={styles.formattedMessage}>
        {sections.map((section, idx) => (
          <div key={idx} className={styles.messageSection}>
            {section.split('\n').map((line, lineIdx) => {
              // Handle headers
              if (line.startsWith('###')) {
                return <h3 key={lineIdx}>{line.replace('###', '').trim()}</h3>;
              }
              // Handle subheaders
              if (line.startsWith('####')) {
                return <h4 key={lineIdx}>{line.replace('####', '').trim()}</h4>;
              }
              // Handle list items
              if (line.startsWith('-') || line.match(/^\d+\./)) {
                const trimmedLine = line.replace(/^-|\d+\./, '').trim();
                return <li key={lineIdx}>{processBoldText(trimmedLine)}</li>;
              }
              // Handle all other lines (including those with bold text)
              return <p key={lineIdx}>{processBoldText(line)}</p>;
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.backgroundWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link href="/chat" className={styles.logo}>
            PLAN VOYAGE AI
          </Link>
          <div className={styles.navbarRight}>
            <div className={styles.languageSelector} ref={languageMenuRef}>
              <div
                className={styles.iconButton}
                onClick={toggleLanguageMenu}
                title={translations.navbar.changeLanguage}
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
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'Italiano' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('Italiano')}
                  >
                    Italiano
                  </div>
                  <div
                    className={`${styles.languageOption} ${currentLanguage === 'Deutsch' ? styles.activeLanguage : ''}`}
                    onClick={() => changeLanguage('Deutsch')}
                  >
                    Deutsch
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
                    {translations.navbar.userMenu.logout}
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
      {!isPlanned && <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', opacity: ".95" }}>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  id="from"
                  freeSolo
                  options={fromOptions}
                  renderInput={(params) => 
                    <TextField 
                      {...params}
                      style={{ width: "100%" }}
                      name="from"
                      label={translations.form.from}
                      variant="outlined"
                      value={formik.values.from}
                      onChange={hacdleChangeFrom}
                      onBlur={formik.handleBlur}
                      error={formik.touched.from && Boolean(formik.errors.from)}
                      helperText={formik.touched.from && formik.errors.from}
                    />
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  id="destination"
                  freeSolo
                  options={toOptions}
                  renderInput={(params) => 
                    <TextField 
                      {...params}
                      style={{ width: "100%" }}
                      name="destination"
                      label={translations.form.destination}
                      variant="outlined"
                      value={formik.values.destination}
                      onChange={handleChangeTo}
                      onBlur={formik.handleBlur}
                      error={formik.touched.destination && Boolean(formik.errors.destination)}
                      helperText={formik.touched.destination && formik.errors.destination}
                    />
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 3 }}>
                <LocalizationProvider 
                  dateAdapter={AdapterDayjs}
                  adapterLocale={
                    currentLanguage === 'English' ? 'en' :
                    currentLanguage === 'Türkçe' ? 'tr' :
                    currentLanguage === 'Español' ? 'es' :
                    currentLanguage === 'Français' ? 'fr' :
                    currentLanguage === 'Italiano' ? 'it' :
                    currentLanguage === 'Deutsch' ? 'de' : 'en'
                  }
                >
                  <DatePicker
                    sx={{ width: "100%" }}
                    label={translations.form.startDate}
                    value={formik.values.startDate}
                    onChange={(date) => formik.setFieldValue('startDate', date)}
                    onClose={() => formik.setFieldTouched('startDate', true)}
                    format="DD/MM/YYYY"
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
                <LocalizationProvider 
                  dateAdapter={AdapterDayjs}
                  adapterLocale={
                    currentLanguage === 'English' ? 'en' :
                    currentLanguage === 'Türkçe' ? 'tr' :
                    currentLanguage === 'Español' ? 'es' :
                    currentLanguage === 'Français' ? 'fr' :
                    currentLanguage === 'Italiano' ? 'it' :
                    currentLanguage === 'Deutsch' ? 'de' : 'en'
                  }
                >
                  <DatePicker
                    sx={{ width: "100%" }}
                    label={translations.form.endDate}
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue('endDate', date)}
                    onClose={() => formik.setFieldTouched('endDate', true)}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        helperText: formik.touched.endDate && formik.errors.endDate as string
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6}}>
                <Autocomplete
                  multiple
                  id="keyWords"
                  options={keyWords}
                  value={formik.values.keyWords}
                  onChange={(_, newValue) => formik.setFieldValue('keyWords', newValue)}
                  onBlur={() => formik.setFieldTouched('keyWords', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={translations.form.keyWords.label}
                      placeholder={translations.form.keyWords.placeholder}
                      error={formik.touched.keyWords && Boolean(formik.errors.keyWords)}
                      helperText={formik.touched.keyWords && formik.errors.keyWords}
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField 
                  style={{ width: "100%" }}
                  id="initialMessage"
                  name="initialMessage"
                  label={translations.form.initialMessage}
                  variant="outlined"
                  value={formik.values.initialMessage}
                  onChange={formik.handleChange}
                />
              </Grid2>
            </Grid2>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              disabled={isLoading}
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
              {translations.form.planTrip}
            </button>
          </div>
        </form>
      </Container>}

      {isPlanned && <div>
        <Container maxWidth="lg" style={{ padding: "20px" }}>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              style={{
                backgroundColor: "#8F55FF",
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                padding: "10px 60px",
                borderRadius: "15px",
                border: "none",
                cursor: "pointer",
                marginBottom: "20px"
              }}
              onClick={() => handleClickPlanAgain()}
            >
              {translations.form.planNewTrip}
            </button>
          </div>
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
                          {content.type === 'text' && formatMessage(content.text)}
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
                  placeholder={translations.chat.typePlaceholder}
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
      </div>}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
