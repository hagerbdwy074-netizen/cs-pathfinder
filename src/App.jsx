import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Loader2, RefreshCw, Compass, BookOpen, Globe, Home as HomeIcon } from 'lucide-react'
import fullQuestions from './questions.json'
import quickQuestions from './questions_quick.json'

const WEBHOOK_URL = "https://hagarmuhammad.app.n8n.cloud/webhook/quiz-analyze"
const ROADMAP_WEBHOOK_URL = "https://hagarmuhammad.app.n8n.cloud/webhook/generate-roadmap"
const translations = {
  en: {
    title: "CS PathFinder",
    step: "Step {current} of {total}",
    next: "Next",
    prev: "Previous",
    analyze: "Analyze",
    retake: "Retake Quiz",
    customThought: "Any other thoughts? (useful to get accurate results)",
    analyzing: "AI is analyzing your career path...",
    processing: "Processing your responses",
    error: "An error occurred. Please try again.",
    notion: "Notion @ ACU",
    notes: "CS-Guide",
    home: "Home",
    matchScore: "Match Score",
    rank: "Rank #{num}",
    
  },
  ar: {
    title: "مرشد مسار علوم الحاسب",
    step: "الخطوة {current} من {total}",
    next: "اللي بعده",
    prev: "ارجع",
    analyze: "وريني مساري",
    retake: "عيد الاختبار",
    customThought: "اكتب اللي في بالك ( مفيدة لنتايج أدق )",
    analyzing: "الذكاء الاصطناعي بيحلل مسارك...",
    processing: "جاري معالجة إجاباتك",
    error: "حصلت مشكلة. جرب تاني.",
    notion: "نوشن @ ACU",
    notes: "دليل حاسبات",
    matchScore: "نسبة التوافق",
    home: "الرئيسية",
    rank: "المركز #{num}",
  
  }
}
// مكون الهيدر كدالة مستقلة خارج App
function Header({ t, lang, onHomeClick, onToggleLang, showProgress, currentStep, totalQuestions, progress }) {
  return (
    <header className="mb-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Compass className="text-[#D3968C] w-8 h-8" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#F7F4D5] tracking-tight">{t.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* زرار العودة للرئيسية */}
          <button 
            onClick={onHomeClick}
            title={lang === 'ar' ? 'الرئيسية' : 'Home'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#105666]/30 hover:bg-[#105666]/60 transition-colors border border-[#105666] text-[#F7F4D5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D3968C]"
          >
            <HomeIcon size={16} />
            <span className="hidden sm:inline">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>

          {/* زرار تبديل اللغة */}
          <button 
            onClick={onToggleLang}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#105666]/30 hover:bg-[#105666]/60 transition-colors border border-[#105666] text-[#F7F4D5] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D3968C]"
          >
            <Globe size={16} />
            {lang === 'en' ? 'مصرى' : 'English'}
          </button>
        </div>
      </div>
      
      {showProgress && (
        <div>
          <div className="flex justify-between text-[#F7F4D5] text-sm font-medium mb-2">
            <span>{t.step.replace('{current}', currentStep + 1).replace('{total}', totalQuestions)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#105666]/40 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#D3968C] h-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </header>
  )
}

// مكون الفوتر كدالة مستقلة خارج App
function Footer({ t }) {
  return (
    <footer className="mt-10 pt-6 border-t border-[#105666] flex flex-col sm:flex-row justify-center items-center gap-6 text-sm relative z-10">
      <a 
        href="https://acucommunity.notion.site/?source=copy_link" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 text-[#F7F4D5]/70 hover:text-[#D3968C] transition-colors font-medium"
      >
        <img src="/Notion_mono.png" className="w-6 h-6 object-contain" alt="notion" />
        <span>{t.notion}</span>
      </a>
      <a 
        href="https://nebulous-antique-bfa.notion.site/cs-guide?source=copy_link" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 text-[#F7F4D5]/70 hover:text-[#D3968C] transition-colors font-medium"
      >
        <BookOpen size={16} />
        <span>{t.notes}</span>
      </a>
    </footer>
  )
}
export default function App({ initialLang = 'en', questionCount = 24, onBack, selectedRoadmap = null }) {
  const questions = questionCount === 10 ? quickQuestions : fullQuestions
  const [lang, setLang] = useState(initialLang)
  const t = translations[lang]
  const isRtl = lang === 'ar'

// حفظ الرودماب في قائمة المحفوظات بدون مسح القديم
 

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [customInputs, setCustomInputs] = useState({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false)
 const [roadmapData, setRoadmapData] = useState(selectedRoadmap)
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(Boolean(selectedRoadmap))
  useEffect(() => {
    if (roadmapData && roadmapData.track) {
      try {
        const existing = JSON.parse(localStorage.getItem('all_saved_roadmaps') || '[]')
        // تجنب تكرار نفس التراك لو اتولد قبل كده
        const filtered = existing.filter(item => item.track !== roadmapData.track)
        const updated = [{
          track: roadmapData.track,
          data: roadmapData,
          savedAt: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
        }, ...filtered]
        
        localStorage.setItem('all_saved_roadmaps', JSON.stringify(updated))
      } catch (e) {
        console.error("Error saving roadmap", e)
      }
    }
  }, [roadmapData, lang])
  useEffect(() => {
    if (selectedRoadmap) {
      setRoadmapData(selectedRoadmap)
      setIsRoadmapOpen(true)
    }
  }, [selectedRoadmap])

  // 1. حفظ النتيجة تلقائياً بمجرد ظهورها
  useEffect(() => {
    if (results) {
      localStorage.setItem('saved_results', JSON.stringify(results))
    }
  }, [results])

  // 2. حفظ الرودماب تلقائياً بمجرد توليدها
  useEffect(() => {
    if (roadmapData) {
      localStorage.setItem('saved_roadmap', JSON.stringify(roadmapData))
    }
  }, [roadmapData])


  const handleFetchRoadmap = async () => {
    const currentTrack = results[activeTab]?.track?.en || results[activeTab]?.track || "Computer Science"
    setIsRoadmapLoading(true)
    try {
      const response = await fetch(ROADMAP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: currentTrack })
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setRoadmapData(data)
      setIsRoadmapOpen(true)
    } catch (err) {
      alert(lang === 'ar' ? 'حصل خطأ في جلب الرودماب. اتأكدي إنك دايسة Execute في n8n' : 'Failed to generate roadmap. Ensure n8n is running.')
    } finally {
      setIsRoadmapLoading(false)
    }
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const progress = ((currentStep + 1) / questions.length) * 100
const handleOptionSelect = (archetype) => {
  const type = currentQuestion.type

  if (type === 'forced_choice') {
   
    setAnswers({ ...answers, [currentQuestion.id]: [archetype] })

  } else if (type === 'forced_ranking') {
    const currentRanking = answers[currentQuestion.id] || {}

    if (currentRanking[archetype] !== undefined) {
  
      const removedRank = currentRanking[archetype]
      const newRanking = {}
      Object.entries(currentRanking).forEach(([key, rank]) => {
        if (key !== archetype) {
          newRanking[key] = rank > removedRank ? rank - 1 : rank
        }
      })
      setAnswers({ ...answers, [currentQuestion.id]: newRanking })
    } else {
     
      const nextRank = Object.keys(currentRanking).length + 1
      setAnswers({
        ...answers,
        [currentQuestion.id]: { ...currentRanking, [archetype]: nextRank }
      })
    }

  } else {
   
    const current = answers[currentQuestion.id] || []
    const isSelected = current.includes(archetype)
    setAnswers({
      ...answers,
      [currentQuestion.id]: isSelected
        ? current.filter(a => a !== archetype)
        : [...current, archetype]
    })
  }

  document.activeElement?.blur()
}

  const handleCustomInputChange = (e) => {
    setCustomInputs({ ...customInputs, [currentQuestion.id]: e.target.value })
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
  const isCurrentAnswered = () => {
  if (currentQuestion.type === 'forced_ranking') {
    const ranking = answers[currentQuestion.id] || {}
    return Object.keys(ranking).length === currentQuestion.options.length
  }
  if (!currentQuestion.options || currentQuestion.options.length === 0) {
    return !!customInputs[currentQuestion.id]?.trim()
  }
  const arr = answers[currentQuestion.id]
  return (Array.isArray(arr) && arr.length > 0) || !!customInputs[currentQuestion.id]?.trim()
}

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en')
  }

 const handleAnalyze = async () => {
  setIsSubmitting(true)
  setError(null)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 35000)

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        customInputs,
        language: lang === 'ar' ? 'Egyptian Arabic' : 'English'
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) throw new Error("Failed to analyze results")

    const data = await response.json()

    const tracks = data.tracks ?? data.output?.tracks

    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error('unexpected_shape')
    }

    setResults(tracks)
    setActiveTab(0)

  } catch (err) {
    clearTimeout(timeoutId)

    if (err.name === 'AbortError') {
      setError(
        lang === 'ar'
          ? 'الطلب استغرق وقت طويل، جرب تاني'
          : 'Request timed out. Please try again.'
      )
    } else {
      setError(t.error)
    }

  } finally {
    setIsSubmitting(false)
  }
}
  const handleRetake = () => {
    setAnswers({})
    setCustomInputs({})
    setCurrentStep(0)
    setResults(null)
    setError(null)
    setActiveTab(0)
  }
  const handleHomeClick = () => {
    // لو الطالب في شاشة النتيجة مفيش داعي للتحذير، يرجع علطول
    if (results) {
      onBack?.()
      return
    }

    // رسالة التحذير لو لسه وسط الكويز
    const message = lang === 'ar'
      ? 'هل أنت متأكد من العودة للصفحة الرئيسية؟ سيتم فقدان كل إجاباتك وتقدمك الحالي.'
      : 'Are you sure you want to return to the home page? All your progress will be lost.'

    if (window.confirm(message)) {
      onBack?.()
    }
  }

  
// لو الرودماب مفتوحة، اعرض صفحة الرودماب المستقلة وافرش الشاشة كلها
 // صفحة الرودماب الكاملة (بزرار رجوع واحد وذكي)
  if (isRoadmapOpen && roadmapData) {
    const isFromSaved = selectedRoadmap || !results

    return (
      <div 
        className="min-h-screen w-full bg-[#092027] text-[#F7F4D5] p-6 sm:p-12 font-sans relative overflow-x-hidden"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* إضاءات الخلفية */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#105666] opacity-20 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D3968C] opacity-15 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-10 pb-16">
          
          {/* شريط التحكم العلوي: الزرار الوحيد للرجوع */}
          <div className="flex items-center justify-between pb-6 border-b border-[#105666]/60">
            <button 
              onClick={() => {
                setIsRoadmapOpen(false)
                if (isFromSaved) {
                  onBack?.()
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#105666]/30 hover:bg-[#105666]/70 border border-[#105666] text-[#F7F4D5] text-sm font-bold transition-all hover:scale-105"
            >
              <span>
                {isFromSaved
                  ? (lang === 'ar' ? '← العودة للرئيسية' : '← Back to Home')
                  : (lang === 'ar' ? '← العودة لنتيجة الكويز' : '← Back to Result')}
              </span>
            </button>

            <span className="text-xs uppercase tracking-widest text-[#D3968C] font-semibold bg-[#D3968C]/10 px-4 py-1.5 rounded-full border border-[#D3968C]/20">
              {lang === 'ar' ? 'خارطة طريق مخصصة' : 'Career Roadmap'}
            </span>
          </div>

          {/* عنوان التراك والوصف */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-[#F7F4D5] tracking-tight">
              {roadmapData.track}
            </h1>
            <p className="text-sm sm:text-base text-[#F7F4D5]/70 max-w-3xl leading-relaxed">
              {lang === 'ar' 
                ? 'خطة تعلم تفصيلية مقسمة لـ 4 مراحل متتالية لتأهيلك للانطلاق في هذا المسار من البداية حتى الاحتراف.'
                : 'A structured, stage-by-stage learning path tailored to take you from fundamentals to advanced industry readiness.'}
            </p>
          </div>

          {/* شبكة المراحل الأربعة الواسعة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roadmapData.stages?.map((stage, sIdx) => (
              <div 
                key={sIdx}
                className="bg-[#105666]/15 hover:bg-[#105666]/25 border border-[#105666]/60 hover:border-[#D3968C]/60 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-md relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-11 h-11 rounded-2xl bg-[#D3968C] text-[#092027] font-black text-lg flex items-center justify-center shadow-lg shadow-[#D3968C]/20">
                      0{stage.stage_number || sIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#D3968C] tracking-widest uppercase">
                      STAGE 0{stage.stage_number || sIdx + 1}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#F7F4D5] mb-5 group-hover:text-[#D3968C] transition-colors">
                    {stage.title}
                  </h2>

                  <ul className="space-y-3 mb-8">
                    {stage.topics?.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#F7F4D5]/85">
                        <span className="w-2 h-2 rounded-full bg-[#D3968C] mt-2 shrink-0" />
                        <span className="leading-relaxed">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {stage.recommended_tools?.length > 0 && (
                  <div className="pt-5 border-t border-[#105666]/50">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#F7F4D5]/50 uppercase me-1">
                        {lang === 'ar' ? 'الأدوات:' : 'Tools:'}
                      </span>
                      {stage.recommended_tools.map((tool, toolIdx) => (
                        <span 
                          key={toolIdx} 
                          className="text-xs px-3.5 py-1 rounded-lg bg-[#092027] text-[#D3968C] border border-[#D3968C]/30 font-semibold"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    )
  }
  // MAIN RENDER
  return (
    <div 
  dir={isRtl ? 'rtl' : 'ltr'} 
  className="min-h-screen bg-[#092027] flex items-center justify-center p-4 sm:p-6 font-sans text-[#F7F4D5] relative overflow-hidden"
>
      
      {/* Ambient Glowing Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#105666] opacity-20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full bg-[#D3968C] opacity-15 blur-[120px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-[#105666] opacity-15 blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-2xl bg-[#105666]/10 rounded-3xl shadow-2xl border border-[#D3968C]/20 p-5 sm:p-10 flex flex-col relative backdrop-blur-xl z-10">
        
        <Header 
  t={t}
  lang={lang}
  onHomeClick={handleHomeClick}
  onToggleLang={toggleLanguage}
  showProgress={!results && !isSubmitting}
  currentStep={currentStep}
  totalQuestions={questions.length}
  progress={progress}
/>

        <main className="flex-1 w-full">
          {/* LOADING SCREEN */}
          {isSubmitting && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Loader2 className="w-14 h-14 text-[#D3968C] animate-spin mb-6" />
              <h2 className="text-2xl font-medium text-[#F7F4D5] mb-2">{t.analyzing}</h2>
              <p className="text-[#F7F4D5]/70">{t.processing}</p>
            </div>
          )}

          {/* RESULTS SCREEN */}
          {!isSubmitting && results && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Segmented Controls for Top 3 */}
              <div className="flex bg-[#105666]/40 p-1.5 rounded-2xl mb-8 gap-1">
                {results.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#D3968C] ${
                      activeTab === idx 
                        ? 'bg-[#D3968C] text-[#092027] shadow-md shadow-[#D3968C]/20' 
                        : 'text-[#F7F4D5]/80 hover:bg-[#105666]/60 hover:text-[#F7F4D5]'
                    }`}
                  >
                    {t.rank.replace('{num}', idx + 1)}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              <div className="bg-[#105666]/20 border border-[#105666] rounded-3xl p-6 sm:p-8 text-center mb-8 backdrop-blur-md">
                {/* اسم التخصص من n8n مباشرة */}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#D3968C] mb-6 tracking-tight">
                 {results[activeTab]?.track?.[lang] || "Career Track"}
                </h2>
                
                {/* نسبة التوافق */}
                <div className="inline-block bg-[#092027]/50 border border-[#D3968C]/10 rounded-2xl p-4 sm:p-5 mb-8 shadow-inner">
                  <p className="text-[#F7F4D5]/70 text-xs sm:text-sm mb-1 uppercase tracking-wider font-semibold">{t.matchScore}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-[#D3968C]">
                    {results[activeTab]?.matchScore || results[activeTab]?.score || 0}%
                  </p>
                </div>

                {/* الشرح والتحليل */}
                <p className="text-[#F7F4D5] text-base sm:text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                  {results[activeTab]?.description?.[lang] || ""}
                </p>

                {/* المهارات المطلوبة */}
                <div className="flex flex-wrap justify-center gap-2 mb-2">
               {(results[activeTab]?.skills?.[lang] || []).map((skill, idx) => (
                    <span key={idx} className="bg-[#105666] border border-[#105666]/50 text-[#F7F4D5] px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                {/* زرار طلب الرودماب بالـ AI */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleFetchRoadmap}
                    disabled={isRoadmapLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all bg-[#D3968C] hover:bg-[#c2847a] text-[#092027] text-sm shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isRoadmapLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'ar' ? 'جاري بناء الرودماب بالذكاء الاصطناعي...' : 'Generating Roadmap with AI...'}</span>
                      </>
                    ) : (
                      <span>{lang === 'ar' ? ' استعراض الرودماب للتخصص' : ' View Career Roadmap'}</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-all bg-[#D3968C] hover:bg-[#c2847a] text-[#092027] focus:outline-none focus:ring-4 focus:ring-[#D3968C]/30 shadow-lg"
                >
                  <RefreshCw size={20} />
                  <span>{t.retake}</span>
                </button>
              </div>
            </div>
          )}

          {/* QUIZ SCREEN */}
          {!isSubmitting && !results && (
            <div className="animate-in fade-in duration-300">
             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F7F4D5] mb-6 sm:mb-8 leading-snug">
  {currentQuestion.question[lang]}
</h2>

             <div className="space-y-3 mb-6">
  {currentQuestion.options && currentQuestion.options.length > 0 ? (
    <>
      {currentQuestion.type === 'forced_ranking' && (
        <p className="text-[#F7F4D5]/50 text-sm mb-4">
          {lang === 'ar'
            ? 'اضغط على الخيارات بالترتيب من الأهم (1) للأقل أهمية'
            : 'Click options in order of preference, from most (1) to least important'}
        </p>
      )}

      {currentQuestion.options.map((option, index) => {
        const type = currentQuestion.type
        const ranking = answers[currentQuestion.id] || {}
        const selectedArray = Array.isArray(answers[currentQuestion.id])
          ? answers[currentQuestion.id]
          : []

        const rankNumber = type === 'forced_ranking' ? ranking[option.archetype] : null
        const isSelected = type === 'forced_ranking'
          ? rankNumber !== undefined
          : selectedArray.includes(option.archetype)

        return (
          <button
            key={index}
            onClick={() => handleOptionSelect(option.archetype)}
            className={`w-full text-start p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D3968C] flex items-center gap-4 ${
              isSelected
                ? 'bg-[#105666] border-[#D3968C] shadow-md shadow-[#D3968C]/10'
                : 'bg-[#105666]/30 border-transparent hover:bg-[#105666]/60 hover:border-[#105666]/50'
            }`}
          >
            {/* رقم الـ Rank لو النوع ranking */}
            {type === 'forced_ranking' && (
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${
                isSelected
                  ? 'bg-[#D3968C] text-[#092027] border-[#D3968C]'
                  : 'border-[#105666] text-[#F7F4D5]/40'
              }`}>
                {rankNumber ?? '—'}
              </span>
            )}

            <p className={`text-sm sm:text-base ${isSelected ? 'text-[#D3968C] font-semibold' : 'text-[#F7F4D5]'}`}>
              {option.text[lang]}
            </p>
          </button>
        )
      })}
    </>
  ) : (
    <textarea
      value={customInputs[currentQuestion.id] || ''}
      onChange={handleCustomInputChange}
      placeholder={lang === 'ar' ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
      className="w-full bg-[#105666]/20 border border-[#105666] rounded-2xl p-4 text-[#F7F4D5] placeholder-[#F7F4D5]/40 focus:outline-none focus:border-[#D3968C] focus:ring-1 focus:ring-[#D3968C] transition-all resize-none h-40 text-sm sm:text-base"
    />
  )}
</div>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
  <div className="mb-8">
    <textarea
      value={customInputs[currentQuestion.id] || ''}
      onChange={handleCustomInputChange}
      placeholder={t.customThought}
      className="w-full bg-[#105666]/20 border border-[#105666] rounded-2xl p-4 text-[#F7F4D5] placeholder-[#F7F4D5]/40 focus:outline-none focus:border-[#D3968C] focus:ring-1 focus:ring-[#D3968C] transition-all resize-none h-16 text-sm sm:text-base"
    />
  </div>
)}

              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-[#F7F4D5] text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[#105666]">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D3968C] ${
                    currentStep === 0
                      ? 'opacity-0 pointer-events-none'
                      : 'text-[#F7F4D5] bg-[#105666]/30 hover:bg-[#105666]'
                  }`}
                >
                  {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  <span className="hidden sm:inline">{t.prev}</span>
                </button>

                {!isLastStep ? (
 <button
  onClick={handleNext}
  disabled={!isCurrentAnswered()}
  className={`flex items-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#D3968C]/30 ${
    isCurrentAnswered()
      ? 'bg-[#D3968C] hover:bg-[#c2847a] text-[#092027] shadow-lg shadow-[#D3968C]/20'
      : 'bg-[#105666]/30 text-[#F7F4D5]/40 cursor-not-allowed'
  }`}
>
    <span>{t.next}</span>
    {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
  </button>
) : (
 <button
  onClick={handleAnalyze}
  disabled={!isCurrentAnswered()}
  className={`flex items-center gap-2 px-6 sm:px-10 py-3 rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#D3968C]/30 ${
    isCurrentAnswered()
      ? 'bg-[#D3968C] hover:bg-[#c2847a] text-[#092027] shadow-lg shadow-[#D3968C]/20'
      : 'bg-[#105666]/30 text-[#F7F4D5]/40 cursor-not-allowed'
  }`}
>
    <span>{t.analyze}</span>
  </button>
)}
              </div>
            </div>
          )}
          {/* نافذة الرودماب المنبثقة */}
         {/* صفحة الرودماب الكاملة */}
        {/* صفحة الرودماب الكاملة والمريحة */}
         
        </main>

        <Footer t={t} />
      </div>
    </div>
  )
}