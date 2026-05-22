 "use client";

import { useState } from "react";

type Analysis = {
  shotType: string;
  composition: string;
  lighting: string;
  cameraAngle: string;
  lensGuess: string;
  filmLook: string;
  mood: string;
  directorInspiration: string;
  weaknesses: string[];
  improvements: string[];
  prompt: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("أريد تحليل سينمائي يساعدني لصناعة أفلام AI. أحب الواقعية القديمة، التحقيق، الإضاءة الخافتة، والكادر الذي يحكي قصة.");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file: File) {
    setErr("");
    setAnalysis(null);
    const dataUrl = await fileToDataUrl(file);
    setImageUrl(dataUrl);
  }

  async function analyze() {
    if (!imageUrl) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/analyze-shot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: imageUrl, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "فشل التحليل");
      setAnalysis(data.analysis);
      const saved = JSON.parse(localStorage.getItem("kadr-library") || "[]");
      localStorage.setItem("kadr-library", JSON.stringify([{ imageUrl, notes, analysis: data.analysis, date: new Date().toISOString() }, ...saved].slice(0, 30)));
    } catch (e: any) {
      setErr(e.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🎬</div>
          <div>
            <h1>KADR AI</h1>
            <p>مساعد تحليل اللقطة</p>
          </div>
        </div>
        <div className="nav">
          <div className="active">🧠 Shot Analyzer</div>
          <div>✨ Prompt Builder</div>
          <div>🎞️ Director DNA</div>
          <div>💡 Lighting Lab</div>
          <div>📷 Lens & Film</div>
          <div>📚 My Library</div>
        </div>
        <div className="taste">
          <b style={{color:"var(--gold)"}}>ذوقك السينمائي</b>
          <p className="muted">واقعية قديمة، تحقيق هادئ، إضاءة طبيعية منخفضة، وعدسات 35mm / 50mm.</p>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div className="headerTop">
            <div>
              <div className="overline">AI Cinematic Backend Connected</div>
              <h2>محلل اللقطة الأوتوماتيك</h2>
            </div>
            <button className="btn secondary" onClick={() => window.location.reload()}>Reset</button>
          </div>
        </header>

        <div className="content">
          <div className="grid">
            <section className="card">
              <div className="cardHead">
                <div>
                  <h3>ارفع صورة أو Frame</h3>
                  <p className="muted">الـ Backend سيرسلها إلى AI ويعيد تحليل منظم.</p>
                </div>
                <label className="btn">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              </div>
              <div className="uploadBox">
                <div className="drop">
                  {imageUrl ? (
                    <img className="preview" src={imageUrl} alt="uploaded frame" />
                  ) : (
                    <div>
                      <div style={{fontSize:46, color:"var(--gold)"}}>⬆️</div>
                      <h3>اختر صورة من هاتفك أو الكمبيوتر</h3>
                      <p className="muted">مثال: مكتب محقق، لقطة نوير، مستشفى، شارع قديم.</p>
                    </div>
                  )}
                </div>

                <div style={{marginTop:16}}>
                  <p className="muted">ملاحظاتك للذكاء الاصطناعي</p>
                  <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} />
                </div>

                <div style={{marginTop:16, display:"flex", gap:10, flexWrap:"wrap"}}>
                  <button className="btn" disabled={!imageUrl || loading} onClick={analyze}>
                    {loading ? "جاري التحليل..." : "Analyze Automatically"}
                  </button>
                </div>

                {err && <p className="error" style={{marginTop:14}}>{err}</p>}
              </div>
            </section>

            <section className="card">
              <div className="cardHead">
                <div>
                  <h3>نتيجة التحليل</h3>
                  <p className="muted">سيظهر هنا تحليل الكادر والإضاءة والعدسة.</p>
                </div>
              </div>

              <div className="result">
                {!analysis && !loading && (
                  <p className="muted">ارفع صورة واضغط Analyze Automatically.</p>
                )}

                {loading && (
                  <p className="muted">الـ Agent يحلل اللقطة الآن: الكادر، الإضاءة، العدسة، Film Look، ثم يكتب Prompt...</p>
                )}

                {analysis && (
                  <>
                    <div className="row"><small>نوع اللقطة</small><p>{analysis.shotType}</p></div>
                    <div className="row"><small>الكادر</small><p>{analysis.composition}</p></div>
                    <div className="row"><small>الإضاءة</small><p>{analysis.lighting}</p></div>
                    <div className="row"><small>زاوية الكاميرا</small><p>{analysis.cameraAngle}</p></div>
                    <div className="row"><small>العدسة المتوقعة</small><p>{analysis.lensGuess}</p></div>
                    <div className="row"><small>الخامة / Film Look</small><p>{analysis.filmLook}</p></div>
                    <div className="row"><small>المود</small><p>{analysis.mood}</p></div>
                    <div className="row"><small>إلهام إخراجي</small><p>{analysis.directorInspiration}</p></div>
                    <div className="row"><small>الأخطاء أو الضعف</small><p>{analysis.weaknesses?.join(" — ")}</p></div>
                    <div className="row"><small>تحسينات مقترحة</small><p>{analysis.improvements?.join(" — ")}</p></div>
                    <p style={{color:"var(--gold)", fontWeight:800}}>Prompt جاهز</p>
                    <div className="prompt">{analysis.prompt}</div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
