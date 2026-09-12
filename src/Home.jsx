import { useState, useEffect } from 'react'
import { Compass, ArrowRight, Globe, Zap, Brain, BookOpen, Bookmark, Trash2, ArrowLeft } from 'lucide-react'
import App from './App.jsx'

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false)
  const [lang, setLang] = useState('en')
  const [questionCount, setQuestionCount] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [activeRoadmap, setActiveRoadmap] = useState(null)
  const [showSavedPage, setShowSavedPage] = useState(false)

  // قراءة كل المسارات المحفوظة من المتصفح
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('all_saved_roadmaps') || '[]')
      setSavedRoadmaps(Array.isArray(stored) ? stored : [])
    } catch {
      setSavedRoadmaps([])
    }
  }, [showQuiz, activeRoadmap, showSavedPage])

// حذف مسار محدد مع رسالة تأكيد
  const handleDeleteRoadmap = (e, trackName) => {
    e.stopPropagation()
    
    const message = lang === 'ar'
      ? `هل أنت متأكد من حذف مسار "${trackName}" من المحفوظات؟`
      : `Are you sure you want to delete "${trackName}" from saved roadmaps?`

    if (window.confirm(message)) {
      const updated = savedRoadmaps.filter(item => item.track !== trackName)
      setSavedRoadmaps(updated)
      localStorage.setItem('all_saved_roadmaps', JSON.stringify(updated))
    }
  }

  const isAr = lang === 'ar'

  // 1. فتح الرودماب المختارة كصفحة كاملة
  if (activeRoadmap) {
    return (
      <App 
        initialLang={lang} 
        selectedRoadmap={activeRoadmap} 
        onBack={() => setActiveRoadmap(null)} 
      />
    )
  }

  // 2. بدء كويز جديد
  if (showQuiz && questionCount) {
    return (
      <App 
        initialLang={lang} 
        questionCount={questionCount} 
        onBack={() => {
          setShowQuiz(false)
          setQuestionCount(null)
        }} 
      />
    )
  }

  // 3. صفحة المسارات المحفوظة المخصصة (Dedicated Saved Roadmaps Page)
  if (showSavedPage) {
    return (
      <div 
        dir={isAr ? 'rtl' : 'ltr'} 
        className="min-h-screen bg-[#092027] text-[#F7F4D5] p-6 sm:p-12 font-sans relative overflow-x-hidden"
      >
        {/* إضاءات الخلفية */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#105666] opacity-25 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#D3968C] opacity-15 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          
          {/* شريط التحكم العلوي */}
          <div className="flex items-center justify-between pb-6 border-b border-[#105666]/60">
            <button 
              onClick={() => setShowSavedPage(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#105666]/30 hover:bg-[#105666]/70 border border-[#105666] text-[#F7F4D5] text-sm font-bold transition-all hover:scale-105"
            >
              <ArrowLeft size={18} className={isAr ? 'rotate-180' : ''} />
              <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#D3968C] font-semibold bg-[#D3968C]/10 px-4 py-1.5 rounded-full border border-[#D3968C]/20">
                {isAr ? 'المحفوظات' : 'Saved Collection'}
              </span>
            </div>
          </div>

          {/* عنوان الصفحة */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#F7F4D5] tracking-tight">
              {isAr ? 'مساراتك المهنية المحفوظة' : 'Saved Career Roadmaps'}
            </h1>
            <p className="text-sm sm:text-base text-[#F7F4D5]/60 mt-2">
              {isAr 
                ? 'اضغط على أي تراك لاستعراض تفاصيل مراحله وأدواته في أي وقت.' 
                : 'Select any saved roadmap to review its stages, topics, and tools.'}
            </p>
          </div>

          {/* شبكة كروت الرودماب المحفوظة */}
          {savedRoadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {savedRoadmaps.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveRoadmap(item.data)}
                  className="bg-[#105666]/15 hover:bg-[#105666]/30 border border-[#105666]/60 hover:border-[#D3968C]/60 rounded-3xl p-6 transition-all duration-300 shadow-xl backdrop-blur-md cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D3968C] tracking-wider uppercase bg-[#092027] px-3 py-1 rounded-lg border border-[#D3968C]/30">
                        {isAr ? 'خارطة طريق' : 'Roadmap'}
                      </span>
                      <span className="text-xs text-[#F7F4D5]/50">
                        {item.savedAt}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-[#F7F4D5] group-hover:text-[#D3968C] transition-colors">
                      {item.track}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#F7F4D5]/70 line-clamp-2">
                      {item.data?.stages?.[0]?.title 
                        ? `${isAr ? 'المرحلة الأولى: ' : 'Stage 1: '} ${item.data.stages[0].title}`
                        : (isAr ? 'انقر لعرض كامل المراحل والأدوات' : 'Click to explore all stages and tools')}
                    </p>
                  </div>

                  {/* شريط الإجراءات أسفل الكارت */}
                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#105666]/40">
                    <span className="text-xs font-bold text-[#D3968C] inline-flex items-center gap-1 group-hover:underline">
                      {isAr ? 'استعراض المسار' : 'View Roadmap'}
                      <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
                    </span>

                    <button 
                      onClick={(e) => handleDeleteRoadmap(e, item.track)}
                      title={isAr ? 'حذف من المحفوظات' : 'Delete'}
                      className="p-2 rounded-xl text-[#F7F4D5]/40 hover:text-red-400 hover:bg-red-950/30 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#105666]/50 rounded-3xl bg-[#105666]/10">
              <BookOpen className="w-12 h-12 text-[#D3968C]/50 mx-auto mb-3" />
              <p className="text-base text-[#F7F4D5]/70 font-medium">
                {isAr ? 'لا توجد مسارات محفوظة حتى الآن.' : 'No saved roadmaps found.'}
              </p>
            </div>
          )}

        </div>
      </div>
    )
  }

  // 4. صفحة الهوم الرئيسية
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="min-h-screen bg-[#092027] flex items-center justify-center p-6 font-sans text-[#F7F4D5] relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#105666] opacity-20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D3968C] opacity-15 blur-[120px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
        className="absolute top-5 end-5 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#105666]/30 hover:bg-[#105666]/60 border border-[#105666] text-[#F7F4D5] text-sm font-medium transition-colors"
      >
        <Globe size={16} />
        {isAr ? 'English' : 'مصرى'}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#105666]/10 backdrop-blur-xl border border-[#D3968C]/20 rounded-3xl shadow-2xl p-8 sm:p-12 text-center space-y-7">

        <div className="flex justify-center items-center gap-3">
          <Compass className="w-10 h-10 text-[#D3968C]" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {isAr ? 'مرشد مسار علوم الحاسب' : 'CS PathFinder'}
          </h1>
        </div>

        <p className="text-[#F7F4D5]/70 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
          {isAr
            ? 'اكتشف مسارك المثالي في علوم الحاسب من خلال كويز سريع وتفاعلي.'
            : 'Discover your ideal CS career track with a quick, AI‑powered quiz.'}
        </p>

        {/* اختيار عدد الأسئلة */}
        <div className="space-y-3">
          <p className="text-[#F7F4D5]/50 text-xs sm:text-sm font-medium uppercase tracking-wider">
            {isAr ? 'اختار نوع الاختبار' : 'Choose quiz length'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setQuestionCount(10)}
              className={`flex-1 py-3.5 px-3 rounded-2xl border transition-all font-bold flex flex-col items-center gap-1 ${
                questionCount === 10
                  ? 'bg-[#105666] border-[#D3968C] text-[#D3968C]'
                  : 'bg-[#105666]/20 border-[#105666]/50 text-[#F7F4D5]/80 hover:bg-[#105666]/40'
              }`}
            >
              <Zap size={20} />
              <span className="text-base">{isAr ? '١٠ أسئلة' : '10 Questions'}</span>
              <span className="text-xs font-normal opacity-70">{isAr ? 'سريع' : 'Quick'}</span>
            </button>
            <button
              onClick={() => setQuestionCount(24)}
              className={`flex-1 py-3.5 px-3 rounded-2xl border transition-all font-bold flex flex-col items-center gap-1 ${
                questionCount === 24
                  ? 'bg-[#105666] border-[#D3968C] text-[#D3968C]'
                  : 'bg-[#105666]/20 border-[#105666]/50 text-[#F7F4D5]/80 hover:bg-[#105666]/40'
              }`}
            >
              <Brain size={20} />
              <span className="text-base">{isAr ? '٢٤ سؤال' : '24 Questions'}</span>
              <span className="text-xs font-normal opacity-70">{isAr ? 'شامل' : 'Full'}</span>
            </button>
          </div>
        </div>

        {/* زرار بدء الكويز */}
        <button
          onClick={() => setShowQuiz(true)}
          disabled={!questionCount}
          className={`w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-[#D3968C]/30 ${
            questionCount
              ? 'bg-[#D3968C] hover:bg-[#c2847a] text-[#092027] shadow-[#D3968C]/20'
              : 'bg-[#105666]/30 text-[#F7F4D5]/40 cursor-not-allowed'
          }`}
        >
          <span>{isAr ? 'ابدأ الاختبار' : 'Start Quiz'}</span>
          <ArrowRight size={20} className={isAr ? 'rotate-180' : ''} />
        </button>

        {/* زرار الانتقال لصفحة المسارات المحفوظة */}
        {savedRoadmaps.length > 0 && (
          <div className="pt-4 border-t border-[#105666]/40">
            <button
              onClick={() => setShowSavedPage(true)}
              className="w-full py-3 px-4 rounded-xl border border-[#105666] bg-[#105666]/25 hover:bg-[#105666]/60 text-[#F7F4D5] text-sm font-bold transition-all flex items-center justify-between hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark size={16} className="text-[#D3968C]" />
                <span>{isAr ? 'المسارات المحفوظة' : 'Saved Roadmaps'}</span>
              </div>
              <span className="text-xs bg-[#D3968C] text-[#092027] px-2.5 py-0.5 rounded-full font-extrabold">
                {savedRoadmaps.length}
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}