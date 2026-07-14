import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Home, 
  Timer, 
  User, 
  Plus, 
  CheckCircle2, 
  Trophy, 
  LogOut, 
  X, 
  ChevronRight,
  Activity,
  Book,
  Code,
  Folder,
  Bell,
  Search,
  Settings,
  Heart, 
  Briefcase, 
  Zap, 
  Star, 
  Coffee, 
  Gamepad2, 
  Smile, 
  Plane, 
  Music, 
  Camera,
  Trash2,
  CalendarPlus,
  Globe,
  Check,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  ChevronLeft
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'obahole-premium-v4';

const ICON_MAP = {
  Folder, Book, Activity, Code, Heart, Briefcase, Zap, Star, Coffee, Gamepad2, Smile, Plane, Music, Camera
};

const AVAILABLE_COLORS = [
  { color: '#FF5A5F', bg: 'rgba(255, 90, 95, 0.2)' },
  { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.2)' },
  { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' },
  { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
  { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.2)' },
];

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Work', iconName: 'Folder', color: '#60A5FA', bgColor: 'rgba(96, 165, 250, 0.2)' },
  { id: '2', name: 'Learning', iconName: 'Book', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.2)' },
  { id: '3', name: 'Health', iconName: 'Activity', color: '#4ADE80', bgColor: 'rgba(74, 222, 128, 0.2)' },
  { id: '4', name: 'Code', iconName: 'Code', color: '#A78BFA', bgColor: 'rgba(167, 139, 250, 0.2)' },
];

const TRANSLATIONS = {
  id: {
    greeting: "Selamat Datang 👋",
    dailyProgress: "Progres Hari Ini",
    progressDesc: "Kamu menyelesaikan {completed} dari {total} tugas.",
    todayTasks: "Daftar Tugas",
    seeAll: "Lihat Semua",
    noTasks: "Belum ada tugas.",
    noTasksDesc: "Ketuk tombol + untuk menambahkan tugas baru.",
    home: "Beranda",
    timer: "Fokus",
    profile: "Profil",
    settings: "Pengaturan",
    manageCategory: "Kelola Kategori",
    language: "Bahasa / Language",
    logout: "Keluar Akun",
    createTask: "Buat Tugas Baru",
    taskTitle: "Nama Tugas",
    time: "Waktu Tugas",
    category: "Kategori",
    syncGoogle: "Sinkron Google Calendar",
    saveTask: "Simpan Tugas",
    newCategory: "Buat Kategori Baru",
    catName: "Nama Kategori",
    chooseIcon: "Pilih Ikon",
    chooseColor: "Pilih Warna",
    addCategory: "Tambah Kategori",
    catList: "Daftar Kategori Anda",
    stayFocus: "Tetap Fokus",
    customTime: "Atur Waktu (Menit)",
    level: "Level",
    xpToNext: "XP lagi untuk naik level",
    completedTasks: "Tugas Selesai",
    startTimer: "Mulai Timer",
    pauseTimer: "Jeda",
    resetTimer: "Ulangi",
    activeTask: "Tugas Aktif",
    chooseTask: "Pilih Tugas untuk Difokuskan",
    noActiveTask: "Tidak ada tugas fokus yang dipilih",
    streak: "Sesi Fokus",
    premiumUser: "Pengguna Setia",
    deleteTask: "Tugas dihapus",
    deleteSuccess: "Tugas berhasil dihapus!"
  },
  en: {
    greeting: "Welcome 👋",
    dailyProgress: "Today's Progress",
    progressDesc: "You completed {completed} out of {total} tasks.",
    todayTasks: "Task List",
    seeAll: "See All",
    noTasks: "No tasks yet.",
    noTasksDesc: "Tap the + button to add a new task.",
    home: "Home",
    timer: "Timer",
    profile: "Profile",
    settings: "Settings",
    manageCategory: "Manage Categories",
    language: "Language / Bahasa",
    logout: "Logout",
    createTask: "Create New Task",
    taskTitle: "Task Title",
    time: "Task Time",
    category: "Category",
    syncGoogle: "Sync Google Calendar",
    saveTask: "Save Task",
    newCategory: "Create New Category",
    catName: "Category Name",
    chooseIcon: "Choose Icon",
    chooseColor: "Choose Color",
    addCategory: "Add Category",
    catList: "Your Categories",
    stayFocus: "Stay Focused",
    customTime: "Set Custom Time (Minutes)",
    level: "Level",
    xpToNext: "XP remaining for level up",
    completedTasks: "Tasks Done",
    startTimer: "Start Timer",
    pauseTimer: "Pause",
    resetTimer: "Reset",
    activeTask: "Active Task",
    chooseTask: "Choose a task to focus on",
    noActiveTask: "No active task selected",
    streak: "Focus Sessions",
    premiumUser: "Valued User",
    deleteTask: "Task deleted",
    deleteSuccess: "Task successfully deleted!"
  }
};

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'trash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.log("Audio deferred");
  }
};

const CategoryIcon = ({ iconName, color, size = 16 }) => {
  const IconCmp = ICON_MAP[iconName] || Folder;
  return <IconCmp size={size} style={{ color }} />;
};

const CircularProgress = ({ value, max, size = 96, strokeWidth = 8, color = "#FF5A5F", trailColor = "#272A30" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeValue = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? safeValue / max : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trailColor} strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-white">{Math.round(percent * 100)}%</span>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({ xp: 0, level: 1, name: 'Sahabat Obahole', lang: 'id', streak: 0 });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [timerDuration, setTimerDuration] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTask, setTimerTask] = useState('');
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'Work', syncGoogle: false });
  const [newCat, setNewCat] = useState({ name: '', iconName: 'Heart', colorObj: AVAILABLE_COLORS[0] });

  const lang = userData.lang || 'id';
  const t = (key, replaceParams = {}) => {
    let text = TRANSLATIONS[lang][key] || key;
    Object.keys(replaceParams).forEach(p => {
      text = text.replace(`{${p}}`, replaceParams[p]);
    });
    return text;
  };

  const handleTabSwitch = (tab) => {
    playSound('click');
    setActiveTab(tab);
  };

  const showNotification = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!auth) {
        setAuthLoading(false);
        return;
      }
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
    
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const qTasks = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => tasksData.push({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    }, (error) => console.error("Error fetching tasks:", error));

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({ 
          xp: data.xp || 0, 
          level: data.level || 1, 
          name: data.name || user.displayName || 'Sahabat Obahole',
          lang: data.lang || 'id',
          streak: data.streak || 0
        });
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
      } else {
        setDoc(profileRef, { xp: 0, level: 1, name: user.displayName || 'Sahabat Obahole', lang: 'id', categories: DEFAULT_CATEGORIES, streak: 0 });
      }
    }, (error) => console.error("Error fetching profile:", error));

    return () => { unsubTasks(); unsubProfile(); };
  }, [user]);

  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      playSound('success');
      setTimerRunning(false);
      showNotification(lang === 'id' ? 'Sesi Fokus Selesai! Kerja Bagus 🏆' : 'Focus Session Finished! Good Job 🏆', 'success');
      
      const updateProgress = async () => {
        const newXp = userData.xp + 30; 
        const nextLevel = Math.floor(newXp / 100) + 1;
        const newStreak = (userData.streak || 0) + 1;
        
        if (user && db) {
          const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
          await setDoc(profileRef, { xp: newXp, level: nextLevel, streak: newStreak }, { merge: true });
        } else {
          setUserData(prev => ({ ...prev, xp: newXp, level: nextLevel, streak: newStreak }));
        }

        if (timerTask) {
          await toggleTaskStatus(timerTask, false);
        }
      };
      updateProgress();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, timerTask, userData, user]);

  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toDateString());
    }
    return dates;
  }, []);

  const displayTasks = useMemo(() => {
    let filtered = tasks.filter(t => {
      if (!t.createdAt) return false;
      return new Date(t.createdAt).toDateString() === selectedDate;
    });
    
    filtered.sort((a, b) => {
      if (a.completed === b.completed) return (a.time || '00:00').localeCompare(b.time || '00:00');
      return a.completed ? 1 : -1;
    });
    return filtered;
  }, [tasks, selectedDate]);

  const completedCount = displayTasks.filter(t => t.completed).length;
  const totalCount = displayTasks.length;

  const handleGoogleLogin = async () => {
    playSound('click');
    setAuthLoading(true);
    if (auth && Object.keys(firebaseConfig).length > 0) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        showNotification(lang === 'id' ? 'Login Google Berhasil!' : 'Google Login Successful!', 'success');
      } catch (error) {
        console.warn("Popup blocked. Fallback.");
        try {
           await signInAnonymously(auth);
           showNotification(lang === 'id' ? 'Masuk sebagai Tamu' : 'Signed in as Guest', 'info');
        } catch(e) {
           setUser({ uid: 'mock-user-id', displayName: 'Simulated User' });
        }
      }
    } else {
      setUser({ uid: 'mock-user-id', displayName: 'Local User' });
      showNotification(lang === 'id' ? 'Mode Offline Aktif' : 'Offline Mode Active', 'info');
    }
    setAuthLoading(false);
  };

  const handleGuestLogin = async () => {
    playSound('click');
    setAuthLoading(true);
    if (auth) {
      try {
        await signInAnonymously(auth);
        showNotification(lang === 'id' ? 'Berhasil Masuk sebagai Tamu' : 'Successfully Entered as Guest');
      } catch (e) {
        setUser({ uid: 'mock-user-id', displayName: 'Sahabat Obahole' });
      }
    } else {
      setUser({ uid: 'mock-user-id', displayName: 'Sahabat Obahole' });
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    playSound('click');
    if (auth) await signOut(auth);
    setUser(null);
    setTasks([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    playSound('click');
    
    const targetDate = new Date(selectedDate);
    const [hours, minutes] = newTask.time.split(':');
    if (hours) {
       targetDate.setHours(parseInt(hours), parseInt(minutes), 0);
    }

    const taskData = {
      title: newTask.title,
      time: newTask.time,
      category: newTask.category,
      completed: false,
      createdAt: targetDate.getTime()
    };

    if (user && db) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), taskData);
      } catch (error) {
        console.error("Error adding task:", error);
      }
    } else {
      setTasks(prev => [...prev, { id: Date.now().toString(), ...taskData }]);
    }
      
    setNewTask({ title: '', time: '08:00', category: categories[0]?.name || 'Work', syncGoogle: false });
    setIsTaskModalOpen(false);
    showNotification(lang === 'id' ? 'Tugas berhasil disimpan!' : 'Task saved successfully!');
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    if (user && db) {
      try {
        const taskRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', taskId);
        await updateDoc(taskRef, { completed: !currentStatus });
        if (!currentStatus) {
          playSound('success');
          const newXp = userData.xp + 15;
          const nextLevel = Math.floor(newXp / 100) + 1;
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { xp: newXp, level: nextLevel }, { merge: true });
          showNotification(lang === 'id' ? 'Tugas Selesai! +15 XP 🏆' : 'Task Complete! +15 XP 🏆', 'success');
        } else {
          playSound('click');
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
      if (!currentStatus) {
        playSound('success');
        const newXp = userData.xp + 15;
        const nextLevel = Math.floor(newXp / 100) + 1;
        setUserData(prev => ({...prev, xp: newXp, level: nextLevel}));
        showNotification(lang === 'id' ? 'Tugas Selesai! +15 XP 🏆' : 'Task Complete! +15 XP 🏆', 'success');
      } else {
        playSound('click');
      }
    }
  };

  const deleteTask = async (taskId) => {
    playSound('trash');
    if (user && db) {
      try {
        const taskRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', taskId);
        await deleteDoc(taskRef);
        showNotification(t('deleteSuccess'), 'info');
      } catch (error) {
        console.error("Error deleting:", error);
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showNotification(t('deleteSuccess'), 'info');
    }
  };

  const toggleLanguage = async () => {
    playSound('click');
    const newLang = lang === 'id' ? 'en' : 'id';
    if (user && db) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { lang: newLang }, { merge: true });
    } else {
      setUserData(prev => ({...prev, lang: newLang}));
    }
  };

  const saveCustomCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    playSound('click');
    
    const newCategoryObj = {
      id: Date.now().toString(), 
      name: newCat.name, 
      iconName: newCat.iconName,
      color: newCat.colorObj.color, 
      bgColor: newCat.colorObj.bg
    };
    const updatedCategories = [...categories, newCategoryObj];
    
    if (user && db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), { categories: updatedCategories }, { merge: true });
        setCategories(updatedCategories);
      } catch (error) {
        console.error("Error saving category:", error);
      }
    } else {
      setCategories(updatedCategories);
    }
    
    setNewCat({ name: '', iconName: 'Heart', colorObj: AVAILABLE_COLORS[0] });
    showNotification(lang === 'id' ? 'Kategori berhasil dibuat!' : 'Category created successfully!', 'success');
  };

  const getCategoryInfo = (catName) => {
    const found = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return found || { color: '#FF5A5F', bgColor: 'rgba(255, 90, 95, 0.2)', iconName: 'Folder' };
  };

  const formatTimerTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleApplyTimerCustomTime = (e) => {
    e.preventDefault();
    playSound('click');
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
      setTimerDuration(mins * 60);
      setTimeLeft(mins * 60);
      setTimerRunning(false);
      setIsTimerSettingsOpen(false);
    }
  };

  const xpPercent = useMemo(() => {
    const currentLevelBaseXP = (userData.level - 1) * 100;
    const currentLevelXP = Math.max(0, userData.xp - currentLevelBaseXP);
    return Math.min(100, (currentLevelXP / 100) * 100);
  }, [userData.xp, userData.level]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#121418]">
         <div className="w-12 h-12 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col p-6 bg-[#121418] text-white overflow-y-auto relative font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#FF5A5F] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-[#60A5FA] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-md mx-auto w-full my-auto py-8">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
             <div className="absolute inset-0 bg-[#FF5A5F] rounded-[40px] transform rotate-45 animate-[spin_20s_linear_infinite] shadow-2xl shadow-[#FF5A5F]/30 opacity-90"></div>
             <div className="absolute inset-2 border-2 border-white/20 rounded-[34px] transform -rotate-12 animate-[spin_15s_linear_infinite_reverse] backdrop-blur-md"></div>
             <div className="z-10 bg-[#1D2026] w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner border border-white/10">
                <CheckCircle2 size={36} className="text-[#FF5A5F] drop-shadow-md" strokeWidth={2.5} />
             </div>
          </div>

          <h1 className="text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">Obahole</h1>
          <p className="text-[#9E9E9E] text-center mb-10 max-w-xs text-sm font-medium leading-relaxed">
            Kelola tugas harianmu, selesaikan fokus belajarmu, dan kumpulkan XP!
          </p>

          <div className="w-full space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-4 rounded-[20px] flex items-center justify-center gap-3 border border-white/10 bg-[#1D2026] hover:bg-[#252830] transition-all duration-300 active:scale-98 shadow-xl shadow-black/30"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.08H2.15V16.92C3.97 20.53 7.7 23 12 23Z" fill="#34A853"/>
                <path d="M5.82 14.08C5.59 13.41 5.46 12.72 5.46 12C5.46 11.28 5.59 10.59 5.82 9.92V7.08H2.15C1.41 8.56 1 10.23 1 12C1 13.77 1.41 15.44 2.15 16.92L5.82 14.08Z" fill="#FBBC05"/>
                <path d="M12 5.37C13.62 5.37 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.7 1 3.97 3.47 2.15 7.08L5.82 9.92C6.7 7.31 9.13 5.37 12 5.37Z" fill="#EA4335"/>
              </svg>
              <span className="font-semibold text-white text-base">Masuk dengan Google</span>
            </button>

            <div className="flex items-center justify-center my-6 opacity-40">
              <div className="w-12 h-[1px] bg-white"></div>
              <span className="px-3 text-xs uppercase tracking-widest font-semibold">atau</span>
              <div className="w-12 h-[1px] bg-white"></div>
            </div>

            <button 
              onClick={handleGuestLogin}
              className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#FF5A5F] to-[#FF7B7F] hover:opacity-95 transition-all duration-300 active:scale-98 font-bold text-white text-base shadow-lg shadow-[#FF5A5F]/20"
            >
              Mulai sebagai Tamu (Offline)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#121418] text-white flex flex-col font-sans select-none pb-24 md:pb-6 relative overflow-x-hidden">
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1D2026] border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce">
          <div className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-ping" />
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-[#121418]/90 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5A5F] to-[#FF7B7F] p-[2px] flex items-center justify-center shadow-lg shadow-[#FF5A5F]/20">
            <div className="w-full h-full bg-[#121418] rounded-[14px] flex items-center justify-center">
              <Trophy size={18} className="text-[#FF5A5F]" />
            </div>
          </div>
          <div>
            <h2 className="text-xs text-gray-400 font-medium">{t('greeting')}</h2>
            <h1 className="text-base font-bold truncate max-w-[140px] text-white">{userData.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#1D2026] px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Level</span>
              <span className="text-sm font-black text-[#FF5A5F]">{userData.level}</span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#FF5A5F]" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
          <Sparkles size={16} className="text-yellow-400 animate-pulse" />
        </div>
      </header>

      <main className="flex-1 px-6 py-2 overflow-y-auto max-w-xl mx-auto w-full">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div 
              className="overflow-x-auto flex gap-3 -mx-6 px-6 flex-nowrap py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {weekDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toDateString() === dateStr;
                
                const dayName = dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();

                return (
                  <button
                    key={dateStr}
                    onClick={() => { playSound('click'); setSelectedDate(dateStr); }}
                    className={`flex flex-col items-center justify-between py-3 px-4 rounded-2xl min-w-[56px] h-20 transition-all duration-200 flex-shrink-0 ${
                      isSelected 
                        ? 'bg-gradient-to-b from-[#FF5A5F] to-[#FF7B7F] text-white shadow-lg shadow-[#FF5A5F]/20 scale-105' 
                        : isToday 
                          ? 'bg-[#1D2026] text-[#FF5A5F] border border-[#FF5A5F]/30' 
                          : 'bg-[#1D2026] text-gray-400 hover:bg-[#252830]'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{dayName}</span>
                    <span className="text-lg font-black">{dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-[#1D2026] to-[#252830] p-5 rounded-[28px] flex items-center justify-between border border-white/5 shadow-xl">
              <div className="space-y-2 max-w-[60%]">
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <Activity size={16} className="text-[#FF5A5F]" />
                  {t('dailyProgress')}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('progressDesc', { completed: completedCount, total: totalCount })}
                </p>
              </div>
              <CircularProgress value={completedCount} max={totalCount || 1} />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">{t('todayTasks')} ({totalCount})</h3>
              <button 
                onClick={() => { playSound('click'); setIsTaskModalOpen(true); }}
                className="p-2.5 bg-gradient-to-r from-[#FF5A5F] to-[#FF7B7F] rounded-xl hover:opacity-90 shadow-md shadow-[#FF5A5F]/25 active:scale-95"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>

            <div className="space-y-3">
              {displayTasks.length > 0 ? (
                displayTasks.map((task) => {
                  const catInfo = getCategoryInfo(task.category);
                  const IconComponent = ICON_MAP[catInfo.iconName] || Folder;

                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        task.completed 
                          ? 'bg-[#1D2026]/40 border-white/5 opacity-60' 
                          : 'bg-[#1D2026] border-white/5 hover:border-[#FF5A5F]/20'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button 
                          onClick={() => toggleTaskStatus(task.id, task.completed)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                            task.completed 
                              ? 'bg-[#FF5A5F] border-[#FF5A5F] text-white scale-95' 
                              : 'border-gray-500 hover:border-[#FF5A5F]'
                          }`}
                        >
                          {task.completed && <Check size={14} strokeWidth={3} />}
                        </button>
                        
                        <div className="flex flex-col flex-1 truncate">
                          <span className={`text-sm font-bold truncate ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#FF5A5F] font-bold bg-[#FF5A5F]/10 px-2 py-0.5 rounded-md">
                              {task.time}
                            </span>
                            <span 
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                              style={{ color: catInfo.color, backgroundColor: catInfo.bgColor }}
                            >
                              <IconComponent size={10} />
                              {task.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        {!task.completed && (
                          <button 
                            onClick={() => {
                              playSound('click');
                              setTimerTask(task.id);
                              setActiveTab('timer');
                            }}
                            title="Mulai Fokus"
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
                          >
                            <Play size={15} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-2 bg-white/5 hover:bg-[#FF5A5F]/10 rounded-xl text-gray-400 hover:text-[#FF5A5F] transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-[#1D2026] rounded-2xl flex items-center justify-center text-gray-500 mb-4 border border-white/5">
                    <CalendarPlus size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-300">{t('noTasks')}</h4>
                  <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                    {t('noTasksDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="space-y-6 flex flex-col items-center justify-center animate-in fade-in duration-300 py-4">
            <div className="w-full flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">{t('stayFocus')}</h3>
              <button 
                onClick={() => { playSound('click'); setIsTimerSettingsOpen(!isTimerSettingsOpen); }}
                className="p-2.5 bg-[#1D2026] border border-white/5 rounded-xl hover:bg-[#252830]"
              >
                <Settings size={18} className="text-gray-400" />
              </button>
            </div>

            {isTimerSettingsOpen && (
              <form onSubmit={handleApplyTimerCustomTime} className="w-full bg-[#1D2026] p-4 rounded-2xl border border-white/5 space-y-3">
                <label className="text-xs font-bold text-gray-400 block">{t('customTime')}</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={customMinutes} 
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    min="1" max="120"
                    className="flex-1 bg-[#121418] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5A5F]"
                  />
                  <button type="submit" className="px-5 bg-[#FF5A5F] text-white rounded-xl text-sm font-bold">Terapkan</button>
                </div>
              </form>
            )}

            <div className="relative w-72 h-72 rounded-full border-4 border-dashed border-[#FF5A5F]/20 flex flex-col items-center justify-center bg-[#1D2026]/50 backdrop-blur-md shadow-2xl">
              <div className={`absolute inset-4 rounded-full border-2 border-dashed border-[#FF5A5F]/40 ${timerRunning ? 'animate-[spin_40s_linear_infinite]' : ''}`} />
              
              <span className="text-5xl font-black tracking-wider font-mono text-white select-all">
                {formatTimerTime(timeLeft)}
              </span>

              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF5A5F] mt-2">
                {timerRunning ? 'Sesi Aktif' : 'Menunggu'}
              </span>

              {timerTask && (
                <div className="mt-4 px-3 py-1 bg-white/5 rounded-full border border-white/10 max-w-[200px] truncate">
                  <span className="text-[10px] text-gray-300 font-medium truncate block">
                    🎯 {tasks.find(t => t.id === timerTask)?.title}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full max-w-xs mt-4">
              <button 
                onClick={() => {
                  playSound('click');
                  setTimerRunning(false);
                  setTimeLeft(timerDuration);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#1D2026] hover:bg-[#252830] transition-colors flex items-center justify-center gap-2 border border-white/5 text-sm font-semibold"
              >
                <RotateCcw size={16} />
                {t('resetTimer')}
              </button>

              <button 
                onClick={() => {
                  playSound('click');
                  setTimerRunning(!timerRunning);
                }}
                className={`flex-[2] py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
                  timerRunning 
                    ? 'bg-amber-500 shadow-amber-500/10' 
                    : 'bg-gradient-to-r from-[#FF5A5F] to-[#FF7B7F] shadow-[#FF5A5F]/20'
                }`}
              >
                {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                {timerRunning ? t('pauseTimer') : t('startTimer')}
              </button>
            </div>

            <div className="w-full bg-[#1D2026] p-5 rounded-3xl border border-white/5 space-y-3 mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('chooseTask')}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {tasks.filter(t => !t.completed).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { playSound('click'); setTimerTask(t.id === timerTask ? '' : t.id); }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      timerTask === t.id 
                        ? 'bg-[#FF5A5F]/10 border-[#FF5A5F] text-[#FF5A5F]' 
                        : 'bg-[#121418] border-white/5 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <span className="text-sm font-bold truncate">{t.title}</span>
                    <span className="text-[10px] font-bold opacity-80">{t.time}</span>
                  </button>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">{t('noActiveTask')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'category' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-black tracking-tight">{t('manageCategory')}</h3>

            <form onSubmit={saveCustomCategory} className="bg-[#1D2026] p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl">
              <h4 className="text-sm font-bold text-[#FF5A5F] flex items-center gap-1.5">
                <Sparkles size={16} />
                {t('newCategory')}
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">{t('catName')}</label>
                <input 
                  type="text" 
                  value={newCat.name}
                  onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                  placeholder="Misal: Keuangan, Hobi..."
                  className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">{t('chooseIcon')}</label>
                <div className="grid grid-cols-7 gap-2.5 bg-[#121418] p-3 rounded-2xl">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const IconCmp = ICON_MAP[iconKey];
                    const isSelected = newCat.iconName === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => { playSound('click'); setNewCat({...newCat, iconName: iconKey}); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#FF5A5F] text-white scale-110 shadow-lg' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <IconCmp size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">{t('chooseColor')}</label>
                <div className="flex gap-3 bg-[#121418] p-3 rounded-2xl justify-between">
                  {AVAILABLE_COLORS.map((col, index) => {
                    const isSelected = newCat.colorObj.color === col.color;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { playSound('click'); setNewCat({...newCat, colorObj: col}); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'scale-110 ring-2 ring-white/40' : 'hover:opacity-80'
                        }`}
                        style={{ backgroundColor: col.color }}
                      >
                        {isSelected && <Check size={16} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF5A5F] to-[#FF7B7F] font-bold text-sm shadow-md shadow-[#FF5A5F]/20 active:scale-95"
              >
                {t('addCategory')}
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('catList')}</h4>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const IconCmp = ICON_MAP[cat.iconName] || Folder;
                  return (
                    <div 
                      key={cat.id}
                      className="p-4 bg-[#1D2026] rounded-2xl border border-white/5 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                        <IconCmp size={18} style={{ color: cat.color }} />
                      </div>
                      <span className="text-sm font-bold truncate text-white">{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-black tracking-tight">{t('profile')}</h3>

            <div className="bg-[#1D2026] p-6 rounded-[32px] border border-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5A5F] rounded-full filter blur-3xl opacity-10" />
              
              <div className="relative w-20 h-20 mb-3">
                <div className="absolute inset-0 bg-[#FF5A5F] rounded-3xl transform rotate-12" />
                <div className="z-10 absolute inset-0.5 bg-[#121418] rounded-[22px] flex items-center justify-center">
                  <User size={36} className="text-[#FF5A5F]" />
                </div>
              </div>

              <h4 className="text-base font-bold text-white flex items-center gap-1.5 justify-center">
                {userData.name}
                <Award size={16} className="text-[#FF5A5F]" />
              </h4>
              <p className="text-xs text-gray-400">{t('premiumUser')}</p>

              <div className="grid grid-cols-3 gap-3 w-full mt-6 bg-[#121418] p-4 rounded-2xl border border-white/5">
                <div className="text-center">
                  <span className="text-xs text-gray-400 block mb-0.5">XP</span>
                  <span className="text-base font-black text-[#FF5A5F]">{userData.xp}</span>
                </div>
                <div className="text-center border-x border-white/5">
                  <span className="text-xs text-gray-400 block mb-0.5">{t('level')}</span>
                  <span className="text-base font-black text-[#FF5A5F]">{userData.level}</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-400 block mb-0.5">{t('streak')}</span>
                  <span className="text-base font-black text-[#FF5A5F]">{userData.streak || 0} 🔥</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1D2026] rounded-3xl border border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings')}</h4>
              </div>

              <div className="divide-y divide-white/5">
                <button 
                  onClick={toggleLanguage}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#252830] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{t('language')}</span>
                      <span className="text-xs text-gray-400">{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{t('logout')}</span>
                      <span className="text-xs text-gray-400">Signout from this session</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1D2026] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t border-white/10 sm:border border-white/5 space-y-4 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{t('createTask')}</h3>
              <button 
                onClick={() => { playSound('click'); setIsTaskModalOpen(false); }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">{t('taskTitle')}</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                  placeholder="Misal: Membaca Buku Jurnal..."
                  className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">{t('time')}</label>
                <input 
                  type="time" 
                  value={newTask.time}
                  onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  required
                  className="w-full bg-[#121418] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400">{t('category')}</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = newTask.category === cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => { playSound('click'); setNewTask({...newTask, category: cat.name}); }}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left truncate ${
                          isSelected 
                            ? 'bg-[#FF5A5F]/10 border-[#FF5A5F] text-[#FF5A5F]' 
                            : 'bg-[#121418] border-white/5 text-gray-300 hover:border-white/10'
                        }`}
                      >
                        <CategoryIcon iconName={cat.iconName} color={isSelected ? '#FF5A5F' : cat.color} size={15} />
                        <span className="text-xs font-bold truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5A5F] to-[#FF7B7F] rounded-xl text-white font-bold text-sm shadow-md shadow-[#FF5A5F]/20 active:scale-95 transition-all"
              >
                {t('saveTask')}
              </button>
            </form>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121418]/90 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center justify-around max-w-xl mx-auto rounded-t-3xl shadow-xl">
        <button 
          onClick={() => handleTabSwitch('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#FF5A5F]' : 'text-gray-500 hover:text-white'}`}
        >
          <Home size={20} className={activeTab === 'home' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold tracking-wider">{t('home')}</span>
        </button>

        <button 
          onClick={() => handleTabSwitch('timer')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'timer' ? 'text-[#FF5A5F]' : 'text-gray-500 hover:text-white'}`}
        >
          <Timer size={20} className={activeTab === 'timer' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold tracking-wider">{t('timer')}</span>
        </button>

        <button 
          onClick={() => handleTabSwitch('category')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'category' ? 'text-[#FF5A5F]' : 'text-gray-500 hover:text-white'}`}
        >
          <Plus size={20} className={activeTab === 'category' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold tracking-wider">Kategori</span>
        </button>

        <button 
          onClick={() => handleTabSwitch('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-[#FF5A5F]' : 'text-gray-500 hover:text-white'}`}
        >
          <User size={20} className={activeTab === 'profile' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold tracking-wider">{t('profile')}</span>
        </button>
      </nav>
    </div>
  );
}
