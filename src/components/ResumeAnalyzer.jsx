import { useState } from "react";
import Tesseract from "tesseract.js"; // OCR for images
import mammoth from "mammoth"; // Word (.docx)

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [analysis, setAnalysis] = useState("");

  // ✅ Google Gemini API
  const geminiApiKey = "AIzaSyDBRv5zQhIS0bMVyIc1xIfvXYMn286R1kk";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // 📂 处理文件上传 (Word / 图片)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const fileType = file.type;

      // ✅ Word (.docx)
      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setResumeText(result.value);
      }

      // ✅ 图片 OCR (jpg/png)
      else if (fileType.startsWith("image/")) {
        const result = await Tesseract.recognize(file, "eng");
        setResumeText(result.data.text);
      } else {
        alert("❌ Unsupported file type! Please upload Word (.docx) or an image.");
      }
    } catch (error) {
      console.error("File processing error:", error);
      alert("❌ Error reading file");
    }

    setLoading(false);
  };

  // 🚀 调用 Gemini API 分析简历
  const analyzeResume = async () => {
    if (!resumeText) {
      alert("请先上传文件或粘贴简历内容！");
      return;
    }

    setLoading(true);
    setAtsScore(null);
    setAnalysis("");

    try {
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Analyze this resume:

${resumeText}

1️⃣ Give an ATS score from 0 to 100 based on how well it would pass an ATS system.
2️⃣ List improvements (keywords, formatting, grammar).
3️⃣ Suggest industry-specific resume tips for Malaysia (Petronas, Grab, Shopee).`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("✅ Gemini API response:", data);

      // 解析 Gemini 返回的文本
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response from Gemini.";

      // ✅ 🔥 改进后的 ATS 分数提取
      let score;
      // 1️⃣ 优先匹配 "85/100" 这种格式
      const slashMatch = aiText.match(/(\d{1,3})\s*\/\s*100/);
      if (slashMatch) {
        score = Math.min(parseInt(slashMatch[1]), 100);
      } else {
        // 2️⃣ 找所有数字，取最大的一个（防止拿到 “1.” 这种序号）
        const allNumbers = aiText.match(/\d{1,3}/g);
        if (allNumbers) {
          score = Math.min(Math.max(...allNumbers.map((n) => parseInt(n))), 100);
        } else {
          score = 60; // 如果完全没数字，给默认值
        }
      }

      setAtsScore(score);
      setAnalysis(aiText);
    } catch (err) {
      console.error("❌ Gemini API 调用错误:", err);
      alert("❌ AI Resume 分析失败");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6">
        📄 AI Resume Analyzer (Gemini)
      </h1>

      {/* 文件上传 */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-lg mb-2">📂 上传简历文件（Word / 图片）</h2>
        <input
          type="file"
          accept=".docx,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="p-2 border border-gray-500 rounded-md w-full bg-slate-700"
        />
      </div>

      {/* 手动粘贴 */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-lg mb-2">✍️ 或者粘贴简历内容</h2>
        <textarea
          rows="6"
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full p-3 rounded-md bg-slate-700 text-white border border-gray-500"
        ></textarea>
      </div>

      {/* 分析按钮 */}
      <button
        onClick={analyzeResume}
        disabled={loading}
        className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-md font-bold hover:scale-105 transition-transform disabled:opacity-50"
      >
        {loading ? "⏳ 分析中..." : "🚀 Analyze Resume"}
      </button>

      {/* ATS Score */}
      {atsScore !== null && (
        <div className="mt-6 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">📊 ATS Score</h2>
          <div className="w-full bg-gray-700 rounded-full h-6">
            <div
              className={`h-6 rounded-full text-right pr-2 text-sm font-bold ${
                atsScore > 70
                  ? "bg-green-500"
                  : atsScore > 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${atsScore}%` }}
            >
              {atsScore}%
            </div>
          </div>
        </div>
      )}

      {/* AI 分析结果 */}
      {analysis && (
        <div className="mt-6 bg-slate-800 p-6 rounded-lg shadow-lg whitespace-pre-line">
          <h2 className="text-xl font-semibold mb-2">💡 AI Suggestions</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
