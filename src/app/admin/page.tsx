'use client'
import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
  queryCount: number;
  lastLogin: string;
}

const AdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('adminUsername');
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/admin-login', {
        username,
        password
      });
      setUsers(response.data.users);
      setIsLoggedIn(true);
      localStorage.setItem('adminUsername', username);
      localStorage.setItem('adminPassword', password);
      toast.success('Giriş başarılı!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Geçersiz kullanıcı adı veya şifre!');
      } else {
        toast.error('Bir hata oluştu!');
      }
    }
  };

  return (
    <div className={styles.container}>
      {!isLoggedIn ? (
        <div className={styles.loginContainer}>
          <h1>Admin Girişi</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Giriş Yap</button>
          </form>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <h1>Kullanıcı Listesi</h1>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <h3>Toplam Kullanıcı</h3>
              <p>{users.length}</p>
            </div>
            <div className={styles.statBox}>
              <h3>Toplam Sorgu</h3>
              <p>{users.reduce((total, user) => total + user.queryCount, 0)}</p>
            </div>
          </div>
          
          {/* Masaüstü için tablo görünümü */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>İsim</th>
                <th>E-posta</th>
                <th>Sağlayıcı</th>
                <th>Kayıt Tarihi</th>
                <th>Son Giriş</th>
                <th>Sorgu Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.provider}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</td>
                  <td>{new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</td>
                  <td>{user.queryCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobil için kart görünümü */}
          <div className={styles.mobileCards}>
            {users.map((user) => (
              <div key={user._id} className={styles.userCard}>
                <div>
                  <span>İsim:</span>
                  <span>{user.name}</span>
                </div>
                <div>
                  <span>E-posta:</span>
                  <span>{user.email}</span>
                </div>
                <div>
                  <span>Sağlayıcı:</span>
                  <span>{user.provider}</span>
                </div>
                <div>
                  <span>Kayıt Tarihi:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</span>
                </div>
                <div>
                  <span>Son Giriş:</span>
                  <span>{new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</span>
                </div>
                <div>
                  <span>Sorgu Sayısı:</span>
                  <span>{user.queryCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
