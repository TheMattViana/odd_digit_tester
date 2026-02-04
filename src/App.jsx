import { useState } from 'react'
import Keypad from './components/Keypad'
import PinDisplay from './components/PinDisplay'

function App() {
  const [step, setStep] = useState('setup-5') // setup-5, interstitial, setup-7, results
  const [pin5, setPin5] = useState('')
  const [pin7, setPin7] = useState('')
  const [analysis, setAnalysis] = useState(null)

  const handleKeyPress = (num) => {
    if (step === 'setup-5') {
      if (pin5.length < 5) {
        const newPin = pin5 + num
        setPin5(newPin)
        if (newPin.length === 5) {
          setTimeout(() => setStep('interstitial'), 300)
        }
      }
    } else if (step === 'setup-7') {
      if (pin7.length < 7) {
        const newPin = pin7 + num
        setPin7(newPin)
        if (newPin.length === 7) {
          setTimeout(() => runAnalysis(newPin), 300)
        }
      }
    }
  }

  const runAnalysis = (finalPin7) => {
    const targetedAppend = finalPin7.startsWith(pin5);
    const isRepeated = /^(\d)\1+$/.test(finalPin7);
    const mentionsSubsequence = finalPin7.includes(pin5);

    setAnalysis({
      targetedAppend,
      repetition: isRepeated,
      subsequence: mentionsSubsequence,
      pin5,
      pin7: finalPin7
    })
    setStep('results')
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white font-sans flex flex-col items-center justify-center">
      {/* Background with blur */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[90px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 flex flex-col h-full max-h-[800px]">
        {step === 'setup-5' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="mt-20 mb-8 text-center">
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

        {step === 'interstitial' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in px-4">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
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
            <div className="mt-20 mb-8 text-center">
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

        {step === 'results' && analysis && (
          <div className="flex-1 flex flex-col justify-center animate-slide-up">
            <div className="bg-black/40 p-1 rounded-3xl backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-6 rounded-[20px]">
                <h2 className="text-2xl font-bold mb-6 text-center">Security Analysis</h2>

                <div className="space-y-4 mb-8">
                  <ResultRow
                    label="Targeted Append"
                    description="Did you just add 2 digits to the end?"
                    detected={analysis.targetedAppend}
                  />
                  <ResultRow
                    label="Repetition Pattern"
                    description="Did you use repeated digits like 1111111?"
                    detected={analysis.repetition}
                  />
                  <ResultRow
                    label="Subsequence Reuse"
                    description="Does your new PIN contain your old PIN?"
                    detected={analysis.subsequence}
                  />
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex justify-between text-sm text-white/60 mb-6">
                  <div>
                    <span className="block text-xs uppercase tracking-wider mb-1">Old PIN</span>
                    <span className="text-xl text-white font-mono tracking-widest">{analysis.pin5}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs uppercase tracking-wider mb-1">New PIN</span>
                    <span className="text-xl text-white font-mono tracking-widest">{analysis.pin7}</span>
                  </div>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 border border-white/20 rounded-xl font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Restart Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ResultRow = ({ label, description, detected }) => (
  <div className={`p-4 rounded-xl border ${detected ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'} flex items-start gap-4 transition-all`}>
    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs border shrink-0 ${detected ? 'border-red-400 text-red-100 bg-red-500' : 'border-green-400 text-green-100 bg-green-500'}`}>
      {detected ? '!' : '✓'}
    </div>
    <div>
      <h4 className={`font-semibold ${detected ? 'text-red-200' : 'text-green-200'}`}>{label}</h4>
      <p className="text-white/60 text-xs mt-1 leading-relaxed">{description}</p>
      {detected && <div className="mt-2 text-[10px] font-mono text-white/90 bg-black/20 px-2 py-1 rounded inline-block">VULNERABILITY DETECTED</div>}
    </div>
  </div>
)

export default App
