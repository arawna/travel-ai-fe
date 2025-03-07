"use client"
import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import styles from './login.module.css'
import EyeIcon from '@/components/icons/EyeIcon'
import EyeSlashIcon from '@/components/icons/EyeSlashIcon'
import GoogleIcon from '@/components/icons/GoogleIcon'
import Link from 'next/link'
import authService from '@/services/authService'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

// Validasyon şeması
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      authService.login({email: values.email, password: values.password}).then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/chat");
      }).catch((error) => {
        toast.error(error.response.data.message);
      });
    }
  });

  const handleGoogleBtnClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>
            Start Plaining Your Trip
        </h1>
        <p className={styles.subTitle}>
            Please login or sign up to continue
        </p>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input 
            type="text" 
            id="email" 
            name="email"
            className={`${styles.input} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className={styles.error}>{formik.errors.email}</div>
          )}
          <div style={{marginTop: "1rem"}}>
            <label htmlFor="password" className={styles.label}>Password</label>
          </div>
          <div className={styles.passwordContainer}>
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              name="password"
              className={`${styles.passwordInput} ${formik.touched.password && formik.errors.password ? styles.inputError : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            <div 
              className={styles.passwordToggle} 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <>
                  <EyeSlashIcon />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <EyeIcon />
                  <span>Show</span>
                </>
              )}
            </div>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className={styles.error}>{formik.errors.password}</div>
          )}
          <button 
            className={styles.loginBtn} 
            type="submit"
          >
            Login
          </button>
          
          <div className={styles.orSeparator}>
            <span>OR</span>
          </div>
          
          <button onClick={() => handleGoogleBtnClick()} className={styles.socialBtn}>
            <GoogleIcon className={styles.googleIcon} />{" "}
            Continue with Google
          </button>
        </form>
        <div className={styles.signupTextContainer}>
            <Link className={styles.signupText} href="/register">Don't you have an account? Sign up</Link>
        </div>
        <Link href="/register"><button className={styles.loginBtn}>Sign up now</button></Link>
      </div>
    </div>
  )
}
