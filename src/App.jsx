import { useState, useEffect } from 'react'
import Keypad from './components/Keypad'
import PinDisplay from './components/PinDisplay'
import { encryptData, importPublicKey } from './utils/crypto'

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8lah8mtzk2qdXvGFn7s2
SqW7j947XSLdRd/QX7SEdDZqk3aJ0FRXpntz6O9mTnj+pxb2wNVBS7WxTBsHDUzk
o0UPgr8El6WthuaxIqtEFVS8mEwhlHASpYNccHRi6wbkxJLKs8eGNjZtF2NFhVYY
avEFDwpU5yCt+z5rk1LTy8h+5GPbrc9w7fvSlIQ4fQzCdRSVwyhW0b3OxumI+Nyk
/j9fo//Vx8J30wLgdk1gMVaEOZETsUGbRp94xq5TWW2GT9QpYDXgC6io3dmnYiO4
EnCowLGaTw4oaVu35Bn34Fkgjthxkbxlk57EYNurFXh5FDFDdHsCBvUKOriiNbNw
ZwIDAQAB
-----END PUBLIC KEY-----`;

function App() {
  const [step, setStep] = useState('setup-5') // setup-5, distractor, recall, interstitial, setup-7, strategy, results
  const [pin5, setPin5] = useState('')
  const [pinRecalled, setPinRecalled] = useState('')
  const [pin7, setPin7] = useState('')
  const [distractorAnswers, setDistractorAnswers] = useState({ q1: '', q2: '' })
  const [analysis, setAnalysis] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle, saving, success, error

  // Survey State
  const [surveyData, setSurveyData] = useState({
    strategy5: '',
    strategy5Other: '',
    strategyReason5: '',
    memorability5: '',
    security5: '',
    usePersonal5: '',
    usePersonalReason5: '',
    strategy7: '',
    strategy7Other: '',
    strategyReason7: '',
    memorability7: '',
    security7: '',
    relation: '',
    relationType: '',
    relationTypeOther: '',
    usePersonal7: '',
    usePersonalReason7: '',
    oddEvenFeelings: ''
  });

  // Encryption Key State
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    async function loadKey() {
      try {
        const key = await importPublicKey(PUBLIC_KEY_PEM);
        setPublicKey(key);
      } catch (e) {
        console.error("Failed to load public key", e);
      }
    }
    loadKey();
  }, []);



  // Treatments
  const TREATMENTS = ['Neutral', 'Breach', 'No-Sub', 'Security', 'Upgrade'];
  const [treatment, setTreatment] = useState(() => TREATMENTS[Math.floor(Math.random() * TREATMENTS.length)]);

  const MESSAGES = {
    'Neutral': "To continue the study, you must upgrade the length from 5 to 7 digits.",
    'Breach': "To continue the study, you must upgrade the length from 5 to 7 digits.",
    'No-Sub': "To continue the study, you must upgrade the length from 5 to 7 digits.",
    'Security': "To continue the study, you must upgrade the length from 5 to 7 digits.",
    'Upgrade': "To continue the study, you must upgrade the length from 5 to 7 digits."
  };


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
          // Check for No-Sub treatment constraint
          if (treatment === 'No-Sub' && newPin.includes(pin5)) {
            setTimeout(() => {
              alert("Security Restriction: You cannot use your previous 5-digit PIN as part of your new 7-digit PIN. Please choose a different PIN.");
              setPin7('');
            }, 100);
            return;
          }
          setTimeout(() => setStep('survey'), 300)
        }
      }
    }

  }

  const handleDelete = () => {
    if (step === 'setup-5') {
      setPin5(prev => prev.slice(0, -1))
    } else if (step === 'recall') {
      setPinRecalled(prev => prev.slice(0, -1))
    } else if (step === 'setup-7') {
      setPin7(prev => prev.slice(0, -1))
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

Treatment: ${data.treatment}

Survey Responses:
-----------------
[5-Digit PIN]
Strategy: ${data.strategy5} ${data.strategy5 === 'other' ? `(${data.strategy5Other})` : ''}
Strategy Reason: ${data.strategyReason5}
Memorability: ${data.memorability5}
Security: ${data.security5}
Use for Personal: ${data.usePersonal5}
Personal Use Reason: ${data.usePersonalReason5}

[7-Digit PIN]
Strategy: ${data.strategy7} ${data.strategy7 === 'other' ? `(${data.strategy7Other})` : ''}
Strategy Reason: ${data.strategyReason7}
Memorability: ${data.memorability7}
Security: ${data.security7}
Relation to 5-digit: ${data.relation}
Relation Type: ${data.relationType} ${data.relationType === 'other' ? `(${data.relationTypeOther})` : ''}
Use for Personal: ${data.usePersonal7}
Personal Use Reason: ${data.usePersonalReason7}

[Comparison]
Odd vs Even Feelings: ${data.oddEvenFeelings}

Analysis Results:
- Targeted Append: ${data.targetedAppend}
- Repetition: ${data.repetition}
- Subsequence: ${data.subsequence}

csv_format:
timestamp,treatment,pin5,pin_recalled,pin7,targeted_append,repetition,subsequence,strategy5,strategy_reason5,memorability5,security5,use_personal5,use_personal_reason5,strategy7,strategy_reason7,memorability7,security7,relation,relation_type,use_personal7,use_personal_reason7,odd_even_feelings
${data.timestamp},${data.treatment},${data.pin5},${data.pinRecalled},${data.pin7},${data.targetedAppend},${data.repetition},${data.subsequence},"${data.strategy5}","${data.strategyReason5}","${data.memorability5}","${data.security5}","${data.usePersonal5}","${data.usePersonalReason5}","${data.strategy7}","${data.strategyReason7}","${data.memorability7}","${data.security7}","${data.relation}","${data.relationType}","${data.usePersonal7}","${data.usePersonalReason7}","${data.oddEvenFeelings}"
    `.trim();

    return `mailto:mmv5513@psu.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // -------------------------------------------------------------------------
  // CONFIGURATION:
  // To enable automatic emailing on GitHub Pages, create a free form at https://formspree.io/
  // and paste your form ID endpoint here (e.g., "https://formspree.io/f/xyz...").
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjbqqoo";
  // -------------------------------------------------------------------------

  const saveData = async (data) => {
    setSaveStatus('saving');
    let saved = false;

    // 1. Try Formspree if configured (Works on GitHub Pages)
    if (FORMSPREE_ENDPOINT) {
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          console.log('Saved to Formspree');
          setSaveStatus('success');
          saved = true;
          return;
        } else {
          console.warn('Formspree returned status:', response.status);
        }
      } catch (err) {
        console.error('Formspree save failed:', err);
      }
    }

    // 2. Try Local Server (Works on localhost)
    if (!saved) {
      try {
        const response = await fetch('/api/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          console.log('Saved to local server');
          setSaveStatus('success');
          saved = true;
          return;
        }
      } catch (_) {
        // Ignore local server errors on production
      }
    }

    // 3. Fallback
    if (!saved) {
      console.warn('Could not save data automatically. User must download/email manually.');
      setSaveStatus('error');
    }
  };

  const runAnalysis = async () => {
    const finalPin7 = pin7;

    // Check Analysis
    const targetedAppend = finalPin7.startsWith(pin5);
    const isRepeated = /^(\d)\1+$/.test(finalPin7);
    const mentionsSubsequence = finalPin7.includes(pin5);

    // Encrypt sensitive fields
    let encPin5 = pin5;
    let encPinRecalled = pinRecalled;
    let encPin7 = finalPin7;

    if (publicKey) {
      try {
        encPin5 = await encryptData(pin5, publicKey);
        encPinRecalled = await encryptData(pinRecalled, publicKey);
        encPin7 = await encryptData(finalPin7, publicKey);
        console.log("Data encrypted successfully");
      } catch (e) {
        console.error("Encryption failed", e);
      }
    }

    const resultData = {
      targetedAppend,
      repetition: isRepeated,
      subsequence: mentionsSubsequence,
      pin5: encPin5,
      pinRecalled: encPinRecalled,
      pin7: encPin7,
      treatment,
      timestamp: new Date().toISOString(),
      ...surveyData
    };

    setAnalysis(resultData)
    setStep('results')
    saveData(resultData);
  }

  const handleEmailClick = () => {
    if (!analysis) return;
    window.location.href = generateEmailUrl(analysis);
  };

  const handleDownload = () => {
    if (!analysis) return;
    const csvContent = `timestamp,treatment,pin5,pin_recalled,pin7,targeted_append,repetition,subsequence,strategy5,strategy_reason5,memorability5,security5,use_personal5,use_personal_reason5,strategy7,strategy_reason7,memorability7,security7,relation,relation_type,use_personal7,use_personal_reason7,odd_even_feelings\n${analysis.timestamp},${analysis.treatment},${analysis.pin5},${analysis.pinRecalled},${analysis.pin7},${analysis.targetedAppend},${analysis.repetition},${analysis.subsequence},"${analysis.strategy5}","${analysis.strategyReason5}","${analysis.memorability5}","${analysis.security5}","${analysis.usePersonal5}","${analysis.usePersonalReason5}","${analysis.strategy7}","${analysis.strategyReason7}","${analysis.memorability7}","${analysis.security7}","${analysis.relation}","${analysis.relationType}","${analysis.usePersonal7}","${analysis.usePersonalReason7}","${analysis.oddEvenFeelings}"`;
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
    <div className="relative w-full h-[100dvh] bg-black overflow-y-auto text-white font-sans">
      {/* Background with blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[90px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto min-h-[100dvh] p-4 flex flex-col justify-center py-6 sm:py-10">
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
            <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
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
            <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
          </div>
        )}

        {step === 'interstitial' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in px-4">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl my-auto">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {treatment === 'Upgrade' ? 'Device Upgrade' : 'Security Update'}
              </h2>
              <p className="text-white/80 leading-relaxed mb-4">
                {MESSAGES[treatment]}
              </p>
              {treatment === 'No-Sub' && (
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg mb-6">
                  <p className="text-red-200 text-sm">
                    <strong>Constraint:</strong> You cannot use your previous 5-digit PIN as a sequential part of your new 7-digit PIN.
                  </p>
                </div>
              )}
              <p className="text-white/60 text-sm mb-8">
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
            <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
          </div>
        )}


        {step === 'survey' && (
          <div className="flex-1 flex flex-col animate-fade-in overflow-y-auto pb-10">
            <div className="mt-6 mb-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md">
                <span className="text-3xl">📝</span>
              </div>
              <h1 className="text-2xl font-medium tracking-wide mb-2">Final Survey</h1>
              <p className="text-white/60 text-sm">Please answer a few questions about your choices.</p>
            </div>

            <div className="space-y-8 px-2 max-w-xl mx-auto w-full">

                            {/* 5-Digit Section */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-blue-300">About your 5-Digit PIN</h3>

                {/* Strategy 5 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">What strategy did you use to select your 5-digit PIN?</label>
                  <div className="space-y-2">
                    {[
                      { v: 'shape', l: 'Shape / Pattern' },
                      { v: 'spelling', l: 'Word / Spelling' },
                      { v: 'date', l: 'Date / Year' },
                      { v: 'phone', l: 'Phone Number' },
                      { v: 'repeating', l: 'Repeating Digits' },
                      { v: 'standard', l: 'My Standard PIN' },
                      { v: 'other', l: 'Other (Specify)' }
                    ].map(opt => (
                      <label key={'s5' + opt.v} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="strategy5"
                          value={opt.v}
                          checked={surveyData.strategy5 === opt.v}
                          onChange={e => setSurveyData({ ...surveyData, strategy5: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt.l}</span>
                      </label>
                    ))}
                    {surveyData.strategy5 === 'other' && (
                      <input
                        type="text"
                        placeholder="Please specify..."
                        className="w-full mt-2 p-2 bg-black/40 border border-white/20 rounded-lg text-sm"
                        value={surveyData.strategy5Other}
                        onChange={e => setSurveyData({ ...surveyData, strategy5Other: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                {/* Why strategy 5 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Why did you utilize this specific strategy?</label>
                  <textarea
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-sm min-h-[80px]"
                    value={surveyData.strategyReason5}
                    onChange={e => setSurveyData({ ...surveyData, strategyReason5: e.target.value })}
                  />
                </div>

                {/* Memorability 5 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">I feel the 5-digit PIN I chose is:</label>
                  <div className="space-y-2">
                    {[
                      'Hard to remember',
                      'Somewhat hard to remember',
                      'Neither easy nor hard to remember',
                      'Somewhat easy to remember',
                      'Easy to remember'
                    ].map(opt => (
                      <label key={'mem5' + opt} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="memorability5"
                          value={opt}
                          checked={surveyData.memorability5 === opt}
                          onChange={e => setSurveyData({ ...surveyData, memorability5: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security 5 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">I feel the 5-digit PIN I chose is:</label>
                  <div className="space-y-2">
                    {[
                      'Insecure',
                      'Somewhat insecure',
                      'Neither secure nor insecure',
                      'Somewhat secure',
                      'Secure'
                    ].map(opt => (
                      <label key={'sec5' + opt} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="security5"
                          value={opt}
                          checked={surveyData.security5 === opt}
                          onChange={e => setSurveyData({ ...surveyData, security5: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usage 5 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Would you utilize this PIN for your personal smartphone?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No', 'Unsure'].map(opt => (
                      <label key={'use5' + opt} className="flex items-center space-x-2">
                        <input type="radio" name="usePersonal5" value={opt} checked={surveyData.usePersonal5 === opt} onChange={e => setSurveyData({ ...surveyData, usePersonal5: e.target.value })} className="accent-blue-500" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usage Reason 5 */}
                <div>
                  <label className="block text-sm font-medium mb-2">Why or why not?</label>
                  <textarea
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-sm min-h-[80px]"
                    value={surveyData.usePersonalReason5}
                    onChange={e => setSurveyData({ ...surveyData, usePersonalReason5: e.target.value })}
                  />
                </div>
              </div>


              {/* 7-Digit Section */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-green-300">About your 7-Digit PIN</h3>

                {/* Strategy 7 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">What strategy did you use to select your 7-digit PIN?</label>
                  <div className="space-y-2">
                    {[
                      { v: 'shape', l: 'Shape / Pattern' },
                      { v: 'spelling', l: 'Word / Spelling' },
                      { v: 'date', l: 'Date / Year' },
                      { v: 'phone', l: 'Phone Number' },
                      { v: 'repeating', l: 'Repeating Digits' },
                      { v: 'standard', l: 'My Standard PIN' },
                      { v: 'other', l: 'Other (Specify)' }
                    ].map(opt => (
                      <label key={'s7' + opt.v} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="strategy7"
                          value={opt.v}
                          checked={surveyData.strategy7 === opt.v}
                          onChange={e => setSurveyData({ ...surveyData, strategy7: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt.l}</span>
                      </label>
                    ))}
                    {surveyData.strategy7 === 'other' && (
                      <input
                        type="text"
                        placeholder="Please specify..."
                        className="w-full mt-2 p-2 bg-black/40 border border-white/20 rounded-lg text-sm"
                        value={surveyData.strategy7Other}
                        onChange={e => setSurveyData({ ...surveyData, strategy7Other: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                {/* Why strategy 7 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Why did you utilize this specific strategy?</label>
                  <textarea
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-sm min-h-[80px]"
                    value={surveyData.strategyReason7}
                    onChange={e => setSurveyData({ ...surveyData, strategyReason7: e.target.value })}
                  />
                </div>

                {/* Memorability 7 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">I feel the 7-digit PIN I chose is:</label>
                  <div className="space-y-2">
                    {[
                      'Hard to remember',
                      'Somewhat hard to remember',
                      'Neither easy nor hard to remember',
                      'Somewhat easy to remember',
                      'Easy to remember'
                    ].map(opt => (
                      <label key={'mem7' + opt} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="memorability7"
                          value={opt}
                          checked={surveyData.memorability7 === opt}
                          onChange={e => setSurveyData({ ...surveyData, memorability7: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security 7 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">I feel the 7-digit PIN I chose is:</label>
                  <div className="space-y-2">
                    {[
                      'Insecure',
                      'Somewhat insecure',
                      'Neither secure nor insecure',
                      'Somewhat secure',
                      'Secure'
                    ].map(opt => (
                      <label key={'sec7' + opt} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="security7"
                          value={opt}
                          checked={surveyData.security7 === opt}
                          onChange={e => setSurveyData({ ...surveyData, security7: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Relation */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Is your 7-digit PIN related to your 5-digit PIN?</label>
                  <div className="space-y-2">
                    {['Yes', 'Somewhat', 'Minimally', 'No'].map(opt => (
                      <label key={'rel' + opt} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                        <input
                          type="radio"
                          name="relation"
                          value={opt}
                          checked={surveyData.relation === opt}
                          onChange={e => setSurveyData({ ...surveyData, relation: e.target.value })}
                          className="accent-blue-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Relation Type */}
                {['Yes', 'Somewhat'].includes(surveyData.relation) && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">If you selected “Yes” or “Somewhat” please select how the PINs were related:</label>
                    <div className="space-y-2">
                      {[
                        {v: 'Appends', l: 'Appends'},
                        {v: 'Prepends', l: 'Prepends'},
                        {v: 'Insertions', l: 'Insertions'},
                        {v: 'Other', l: 'Other (Specify)'}
                      ].map(opt => (
                        <label key={'relType' + opt.v} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10">
                          <input
                            type="radio"
                            name="relationType"
                            value={opt.v}
                            checked={surveyData.relationType === opt.v}
                            onChange={e => setSurveyData({ ...surveyData, relationType: e.target.value })}
                            className="accent-blue-500"
                          />
                          <span className="text-sm">{opt.l}</span>
                        </label>
                      ))}
                      {surveyData.relationType === 'Other' && (
                        <input
                          type="text"
                          placeholder="Please specify..."
                          className="w-full mt-2 p-2 bg-black/40 border border-white/20 rounded-lg text-sm"
                          value={surveyData.relationTypeOther}
                          onChange={e => setSurveyData({ ...surveyData, relationTypeOther: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Usage 7 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Would you utilize this PIN for your personal smartphone?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No', 'Unsure'].map(opt => (
                      <label key={'use7' + opt} className="flex items-center space-x-2">
                        <input type="radio" name="usePersonal7" value={opt} checked={surveyData.usePersonal7 === opt} onChange={e => setSurveyData({ ...surveyData, usePersonal7: e.target.value })} className="accent-blue-500" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usage Reason 7 */}
                <div>
                  <label className="block text-sm font-medium mb-2">Why or why not?</label>
                  <textarea
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-sm min-h-[80px]"
                    value={surveyData.usePersonalReason7}
                    onChange={e => setSurveyData({ ...surveyData, usePersonalReason7: e.target.value })}
                  />
                </div>
              </div>

              {/* Part Three Section */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold mb-4 text-purple-300">Even v. Odd</h3>

                {/* Odd/Even question */}
                <div>
                  <label className="block text-sm font-medium mb-2">How did you feel about using “Odd” passwords (all odd digits) compared to “Even” (e.g. 4 or 6 digits)? You may consider security, memorability, strategy, or anything else.</label>
                  <textarea
                    className="w-full p-3 bg-black/40 border border-white/20 rounded-xl text-sm min-h-[80px]"
                    value={surveyData.oddEvenFeelings}
                    onChange={e => setSurveyData({ ...surveyData, oddEvenFeelings: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 pb-12">
                <button
                  onClick={runAnalysis}
                  className="w-full py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 shadow-lg shadow-white/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Submit All Results
                </button>
              </div>

            </div>
          </div>
        )}

        {step === 'results' && analysis && (
          <div className="flex-1 flex flex-col justify-center animate-slide-up my-auto">
            <div className="bg-white/10 p-1 rounded-3xl backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-black/40 p-8 rounded-[20px] text-center">

                {saveStatus === 'saving' && (
                  <div className="mb-6">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold">Saving Results...</h2>
                  </div>
                )}

                {saveStatus === 'success' && (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                      ✓
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Results Saved!</h2>
                    <p className="text-white/70 mb-8 max-w-[280px] mx-auto">
                      Thank you for participating in this study.
                    </p>
                  </>
                )}

                {saveStatus === 'error' && (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                      !
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Saving Failed</h2>
                    <p className="text-white/70 mb-6 max-w-[280px] mx-auto text-sm">
                      Please use the buttons below to save your data manually.
                    </p>
                  </>
                )}

                <div className="space-y-3">

                  {/* Only show email button if save failed or user wants to backup */}
                  <button
                    onClick={handleEmailClick}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-900/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Data (Backup)
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
