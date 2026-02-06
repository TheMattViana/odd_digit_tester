import { useState } from 'react'
import Keypad from './components/Keypad'
import PinDisplay from './components/PinDisplay'

function App() {
  const [step, setStep] = useState('setup-5') // setup-5, distractor, recall, interstitial, setup-7, strategy, results
  const [pin5, setPin5] = useState('')
  const [pinRecalled, setPinRecalled] = useState('')
  const [pin7, setPin7] = useState('')
  const [strategy, setStrategy] = useState('')
  const [otherStrategyText, setOtherStrategyText] = useState('')
  const [distractorAnswers, setDistractorAnswers] = useState({ q1: '', q2: '' })
  const [analysis, setAnalysis] = useState(null)

  const handleKeyPress = (num) => {
    if (step === 'setup-5') {
      if (pin5.length < 5) {
        const newPin = pin5 + num
        setPin5(newPin)
        if (newPin.length === 5) {
          setTimeout(() => setStep('distractor'), 300)
        }
      }
    } else if (step === 'recall') {
      if (pinRecalled.length < 5) {
        const newPin = pinRecalled + num
        setPinRecalled(newPin)
        if (newPin.length === 5) {
          if (newPin === pin5) {
            setTimeout(() => setStep('interstitial'), 300)
          } else {
            setTimeout(() => {
              alert("PIN does not match! Please try again or create a new PIN if you forgot.")
              setPinRecalled('')
            }, 300)
          }
        }
      }
    } else if (step === 'setup-7') {
      if (pin7.length < 7) {
        const newPin = pin7 + num
        setPin7(newPin)
        if (newPin.length === 7) {
          setTimeout(() => setStep('strategy'), 300)
        }
      }
    }
  }


  const handleDistractorSubmit = (e) => {
    e.preventDefault();
    if (distractorAnswers.q1 && distractorAnswers.q2) {
      setStep('recall');
    }
  }

  const generateEmailUrl = (data) => {
    const subject = "PIN Upgrade Study Data";
    const body = `
Study Data Submission
---------------------
Timestamp: ${data.timestamp}
PIN 5: ${data.pin5}
PIN 7: ${data.pin7}

Strategy: ${data.strategy}

Analysis Results:
- Targeted Append: ${data.targetedAppend}
- Repetition: ${data.repetition}
- Subsequence: ${data.subsequence}

csv_format:
timestamp,pin5,pin_recalled,pin7,strategy,targeted_append,repetition,subsequence
${data.timestamp},${data.pin5},${data.pinRecalled},${data.pin7},"${data.strategy}",${data.targetedAppend},${data.repetition},${data.subsequence}
    `.trim();

    return `mailto:mmv5513@psu.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const runAnalysis = () => {
    const finalPin7 = pin7;
    const finalStrategy = strategy === 'other' ? `Other: ${otherStrategyText}` : strategy;

    const targetedAppend = finalPin7.startsWith(pin5);
    const isRepeated = /^(\d)\1+$/.test(finalPin7);
    const mentionsSubsequence = finalPin7.includes(pin5);

    const resultData = {
      targetedAppend,
      repetition: isRepeated,
      subsequence: mentionsSubsequence,
      pin5,
      pinRecalled,
      pin7: finalPin7,
      strategy: finalStrategy,
      timestamp: new Date().toISOString()
    };

    setAnalysis(resultData)
    setStep('results')

    // Automatically try to open email
    setTimeout(() => {
      window.location.href = generateEmailUrl(resultData);
    }, 500);
  }

  const handleEmailClick = () => {
    if (!analysis) return;
    window.location.href = generateEmailUrl(analysis);
  };

  const handleDownload = () => {
    if (!analysis) return;
    const csvContent = `timestamp,pin5,pin_recalled,pin7,strategy,targeted_append,repetition,subsequence\n${analysis.timestamp},${analysis.pin5},${analysis.pinRecalled},${analysis.pin7},"${analysis.strategy}",${analysis.targetedAppend},${analysis.repetition},${analysis.subsequence}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pin_study_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="relative w-full min-h-[100dvh] bg-black overflow-y-auto text-white font-sans flex flex-col items-center justify-center">
      {/* Background with blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[90px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 flex flex-col h-full min-h-[100dvh] sm:min-h-0 sm:h-auto">
        {step === 'setup-5' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mt-10 sm:mt-20 mb-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Create a 5-digit PIN</h1>
              <p className="text-white/60 text-sm">Enter a new secure PIN using the keypad.</p>
            </div>

            <PinDisplay length={5} pInLength={pin5.length} />
            <Keypad onKeyPress={handleKeyPress} />
          </div>
        )}

        {step === 'distractor' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mt-10 mb-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <span className="text-3xl">📱</span>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Verification</h1>
              <p className="text-white/60 text-sm">Please answer these quick questions.</p>
            </div>

            <form onSubmit={handleDistractorSubmit} className="space-y-6 px-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">What brand of smartphone do you use?</label>
                <input
                  type="text"
                  required
                  value={distractorAnswers.q1}
                  onChange={(e) => setDistractorAnswers({ ...distractorAnswers, q1: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Apple, Samsung..."
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">What is your average screen time?</label>
                <select
                  required
                  value={distractorAnswers.q2}
                  onChange={(e) => setDistractorAnswers({ ...distractorAnswers, q2: e.target.value })}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="" className="bg-black">Select an option...</option>
                  <option value="low" className="bg-black">Less than 2 hours</option>
                  <option value="medium" className="bg-black">2-4 hours</option>
                  <option value="high" className="bg-black">4+ hours</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 mt-4"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {step === 'recall' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mt-10 sm:mt-20 mb-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <svg className="w-8 h-8 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Confirm 5-digit PIN</h1>
              <p className="text-white/60 text-sm">Please re-enter your PIN to verify memory.</p>
            </div>

            <PinDisplay length={5} pInLength={pinRecalled.length} />
            <Keypad onKeyPress={handleKeyPress} />
          </div>
        )}

        {step === 'interstitial' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in px-4">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl my-auto">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <h2 className="text-2xl font-bold mb-4">Security Upgrade Required</h2>
              <p className="text-white/80 leading-relaxed mb-8">
                Imagine you are upgrading your smartphone to a system that requires higher security.
                You must now select a <strong className="text-blue-300">7-digit PIN</strong> to continue.
              </p>
              <button
                onClick={() => setStep('setup-7')}
                className="w-full py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'setup-7' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mt-10 sm:mt-20 mb-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Create a 7-digit PIN</h1>
              <p className="text-white/60 text-sm">Upgrade your security with a longer PIN.</p>
            </div>

            <PinDisplay length={7} pInLength={pin7.length} />
            <Keypad onKeyPress={handleKeyPress} />
          </div>
        )}


        {step === 'strategy' && (
          <div className="flex-1 flex flex-col animate-fade-in  overflow-y-auto">
            <div className="mt-10 mb-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <span className="text-3xl">🧠</span>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Strategy</h1>
              <p className="text-white/60 text-sm">How did you choose your 7-digit PIN?</p>
            </div>

            <div className="space-y-3 px-2">
              {[
                { id: 'shape', label: 'Based on a shape or pattern' },
                { id: 'spelling', label: 'Numbers to spell a word/name' },
                { id: 'date', label: 'Important date (birthday, etc.)' },
                { id: 'phone_repeat', label: 'Phone number or repeated digits' },
                { id: 'other', label: 'Other' }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${strategy === option.id
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={option.id}
                    checked={strategy === option.id}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="mr-3 w-5 h-5 accent-blue-500"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}

              {strategy === 'other' && (
                <textarea
                  value={otherStrategyText}
                  onChange={(e) => setOtherStrategyText(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full mt-2 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 min-h-[80px]"
                />
              )}
            </div>

            <div className="mt-8 pb-8">
              <button
                onClick={runAnalysis}
                disabled={!strategy || (strategy === 'other' && !otherStrategyText.trim())}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${!strategy || (strategy === 'other' && !otherStrategyText.trim())
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-100 active:scale-95 shadow-lg shadow-white/10'
                  }`}
              >
                Submit Results
              </button>
            </div>
          </div>
        )}

        {step === 'results' && analysis && (
          <div className="flex-1 flex flex-col justify-center animate-slide-up my-auto">
            <div className="bg-white/10 p-1 rounded-3xl backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-black/40 p-8 rounded-[20px] text-center">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                  ✓
                </div>
                <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
                <p className="text-white/70 mb-8 max-w-[280px] mx-auto">
                  Your response should open in your email app automatically. If not, check below.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleEmailClick}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-900/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email Again
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-white/5 text-white/60 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Log (Backup)
                  </button>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-8 text-white/30 text-xs uppercase tracking-widest hover:text-white/50 transition-colors cursor-pointer"
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  )
}

export default App
