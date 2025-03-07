"use client"
import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import styles from './register.module.css'
import EyeIcon from '@/components/icons/EyeIcon'
import EyeSlashIcon from '@/components/icons/EyeSlashIcon'
import GoogleIcon from '@/components/icons/GoogleIcon'
import Link from 'next/link'
import authService from '@/services/authService'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

// Validasyon şeması
const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  terms: Yup.boolean()
    .oneOf([true], 'You must accept the terms of use')
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
      password: '',
      name: '',
      terms: false
    },
    validationSchema,
    onSubmit: async (values) => {
      authService.register({email: values.email, password: values.password, name: values.name}).then((response) => {
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
            Sign Up
        </h1>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="name" className={styles.label}>Full name</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            className={`${styles.input} ${formik.touched.name && formik.errors.name ? styles.inputError : ''}`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <div className={styles.error}>{formik.errors.name}</div>
          )}
          <div style={{marginTop: "1rem"}}>
            <label htmlFor="email" className={styles.label}>Email</label>
          </div>
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
          
          <div className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              className={styles.checkbox} 
              id="terms" 
              name="terms"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.terms}
            />
            <span className={styles.checkboxText}>By creating an account, I agree to our Terms of use and Privacy Policy</span>
          </div>
          {formik.touched.terms && formik.errors.terms && (
            <div className={styles.error}>{formik.errors.terms}</div>
          )}
          
          <button 
            className={styles.loginBtn} 
            type="submit"
          >
            Sign Up
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
            <Link className={styles.signupText} href="/login">Already have an ccount? Log in  </Link>
        </div>
        <Link href="/login"><button className={styles.loginBtn}>Login</button></Link>
      </div>
    </div>
  )
}
