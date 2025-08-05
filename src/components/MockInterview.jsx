import { useState, useEffect } from "react";
import { Clock, Mic, MicOff, User, Star, Play, RotateCcw } from "lucide-react";

export default function MockInterview() {
  const [language, setLanguage] = useState("English");
  const [industry, setIndustry] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stage, setStage] = useState("setup"); // setup, interview, completed
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [interviewerMessage, setInterviewerMessage] = useState("");

  // 计时器
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const geminiApiKey = "AIzaSyDBRv5zQhIS0bMVyIc1xIfvXYMn286R1kk";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // 开始面试
  const startInterview = async () => {
    if (!industry.trim()) {
      alert("Please enter an industry");
      return;
    }
    
    setLoading(true);
    setInterviewerMessage("Generating your personalized interview questions...");
    
    try {
      const prompt = `
You are an HR interviewer for ${industry} industry.

Language: ${language}
Industry: ${industry}
Scenario: Professional HR Interview

Generate exactly 5 realistic interview questions commonly asked in ${industry} interviews in ${language}.
Questions should progress from basic to more challenging.

Strict JSON format:
{"questions":["Q1","Q2","Q3","Q4","Q5"]}
`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      setQuestions(parsed.questions);
      setStage("interview");
      setIsTimerRunning(true);
      setInterviewerMessage("Hello! Welcome to your interview. Let's begin with the first question.");
    } catch (err) {
      console.error("Gemini error", err);
      setInterviewerMessage("Sorry, there was an error generating questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 提交答案
  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      setInterviewerMessage("Please provide an answer before moving to the next question.");
      return;
    }
    
    const newAnswers = { ...answers, [questions[currentQuestion]]: currentAnswer };
    setAnswers(newAnswers);
    setCurrentAnswer("");
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setInterviewerMessage("Great! Let's move on to the next question.");
    } else {
      setIsTimerRunning(false);
      setInterviewerMessage("Thank you for completing the interview. I'm now evaluating your responses...");
      evaluateAnswers(newAnswers);
    }
  };

  // AI评估
  const evaluateAnswers = async (finalAnswers) => {
    setLoading(true);
    try {
      const prompt = `
As an HR professional, evaluate these interview answers for a ${industry} position.

Questions and Answers:
${Object.entries(finalAnswers).map(([q, a], i) => `Q${i+1}: ${q}\nAnswer: ${a}`).join('\n\n')}

Language used: ${language}
Industry: ${industry}

Provide detailed evaluation with:
1. Overall interview performance (1-10 scale)
2. Communication skills rating (1-5)
3. Technical knowledge rating (1-5) 
4. Professionalism rating (1-5)
5. 3-5 specific improvement suggestions
6. 2-3 strengths identified

Strict JSON format:
{
  "overall_score": 8,
  "communication": 4,
  "technical": 3,
  "professionalism": 5,
  "strengths": ["strength1", "strength2"],
  "improvements": ["tip1", "tip2", "tip3"],
  "summary": "Brief overall assessment"
}
`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
      setFeedback(parsed);
      setStage("completed");
      setInterviewerMessage("Interview evaluation completed. Here's your detailed feedback!");
    } catch (err) {
      console.error("Gemini evaluation error", err);
      setInterviewerMessage("There was an error evaluating your interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 语音识别
  const startSpeech = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "Bahasa Malaysia" ? "ms-MY" : 
                      language === "Chinese" ? "zh-CN" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCurrentAnswer(transcript);
    };
    
    recognition.onerror = (err) => {
      console.error("Speech error", err);
      setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  // 重新开始
  const resetInterview = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setCurrentAnswer("");
    setFeedback(null);
    setStage("setup");
    setTimer(0);
    setIsTimerRunning(false);
    setInterviewerMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mock Interview Simulator</h1>
                <p className="text-gray-600">Professional Interview Practice Platform</p>
              </div>
            </div>
            {stage === "interview" && (
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock size={20} className="text-gray-600" />
                <span className="font-mono text-lg">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Setup Stage */}
        {stage === "setup" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Prepare for Your Interview</h2>
              <p className="text-gray-600">Configure your interview settings to get started</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Language
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Bahasa Malaysia</option>
                  <option>Chinese</option>
                  <option>Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry/Field
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Software Engineering, Marketing, Finance"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              
              <button
                onClick={startInterview}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Preparing Interview...</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Start Interview</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Interview Stage */}
        {stage === "interview" && (
          <div className="space-y-6">
            {/* Interviewer Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">HR Interviewer</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{interviewerMessage}</p>
                </div>
              </div>
            </div>

            {/* Question Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Question {currentQuestion + 1} of {questions.length}
                </h2>
                <div className="flex space-x-2">
                  {Array.from({ length: questions.length }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < currentQuestion ? 'bg-green-500' :
                        i === currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-lg text-gray-800">{questions[currentQuestion]}</p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your answer here or use the microphone to speak..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={isRecording ? stopRecording : startSpeech}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentQuestion === questions.length - 1 ? 'Complete Interview' : 'Next Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Stage */}
        {stage === "completed" && feedback && (
          <div className="space-y-6">
            {/* Interviewer Final Message */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">HR Interviewer</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{interviewerMessage}</p>
                </div>
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Complete!</h2>
                <p className="text-gray-600">Total Time: {formatTime(timer)}</p>
              </div>

              {/* Score Overview */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{feedback.overall_score}/10</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < feedback.communication ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Communication</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < feedback.technical ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Technical Knowledge</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < feedback.professionalism ? "text-yellow-400 fill-current" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Professionalism</div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-4 flex items-center">
                    <Star className="mr-2" size={20} />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="text-green-700 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-lg">
                  <h3 className="font-bold text-amber-800 mb-4">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {feedback.improvements.map((tip, idx) => (
                      <li key={idx} className="text-amber-700 flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Overall Assessment</h3>
                <p className="text-gray-700">{feedback.summary}</p>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={resetInterview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <RotateCcw size={20} />
                  <span>Start New Interview</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}