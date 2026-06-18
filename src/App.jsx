import { useState, useRef } from "react";

const OFFICER_USERNAME = "officer";
const OFFICER_PASSWORD = "class2025";

function daysLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  const d = Math.ceil(diff / 86400000);
  if (d < 0) return { label: "Past due", color: "#c0392b" };
  if (d === 0) return { label: "Due today", color: "#e67e22" };
  if (d <= 3) return { label: `${d}d left`, color: "#e67e22" };
  return { label: `${d}d left`, color: "#27ae60" };
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function Toast({ msg, onDone }) {
  useState(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); });
  return (
    <div style={{
      position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",
      background:"#1a1a2e",color:"#fff",padding:"12px 24px",borderRadius:8,
      fontFamily:"'Patrick Hand',cursive",fontSize:15,zIndex:9999,
      boxShadow:"0 4px 20px rgba(0,0,0,0.3)"
    }}>{msg}</div>
  );
}

export default function App() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [officer, setOfficer] = useState(false);
  const [view, setView] = useState("board");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); };

  const openDetail = (asgn) => { setSelected(asgn); setView("detail"); };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setSubmissions(prev => { const n = {...prev}; delete n[id]; return n; });
    setView("board");
    showToast("Assignment deleted.");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0ece0", fontFamily:"'Patrick Hand',cursive" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Architects+Daughter&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input,textarea{font-family:'Patrick Hand',cursive;}
      `}</style>

      {/* NAV */}
      <nav style={{
        background:"#1a1a2e",color:"#fff",padding:"0 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        height:56,position:"sticky",top:0,zIndex:100,
        boxShadow:"0 2px 12px rgba(0,0,0,0.3)"
      }}>
        <button onClick={()=>setView("board")} style={{
          background:"none",border:"none",color:"#fff",cursor:"pointer",
          fontFamily:"'Architects Daughter',cursive",fontSize:20
        }}>📋 ClassBoard</button>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {officer && (
            <button onClick={()=>setView("create")} style={{
              background:"#e74c3c",color:"#fff",border:"none",borderRadius:6,
              padding:"7px 16px",cursor:"pointer",fontFamily:"'Patrick Hand',cursive",
              fontSize:14,fontWeight:"bold"
            }}>+ New Assignment</button>
          )}
          {officer ? (
            <button onClick={()=>{setOfficer(false);setView("board");showToast("Logged out.");}} style={navBtn}>
              Log out
            </button>
          ) : (
            <button onClick={()=>setView("login")} style={navBtn}>
              Officer Login
            </button>
          )}
        </div>
      </nav>

      <div style={{maxWidth:820,margin:"0 auto",padding:"28px 16px 60px"}}>
        {view==="board" && <BoardView assignments={assignments} submissions={submissions} onOpen={openDetail} />}
        {view==="login" && (
          <LoginView
            onLogin={()=>{setOfficer(true);setView("board");showToast("Welcome, Officer! 👮");}}
            onBack={()=>setView("board")}
          />
        )}
        {view==="create" && (
          <CreateView
            onSave={(asgn)=>{setAssignments(prev=>[asgn,...prev]);setView("board");showToast("Assignment posted! ✅");}}
            onBack={()=>setView("board")}
          />
        )}
        {view==="detail" && selected && (
          <DetailView
            asgn={selected}
            subs={submissions[selected.id]||[]}
            isOfficer={officer}
            onSubmit={(sub)=>{
              setSubmissions(prev=>({...prev,[selected.id]:[sub,...(prev[selected.id]||[])]}));
              showToast("Submitted! 🎉");
            }}
            onDelete={()=>deleteAssignment(selected.id)}
            onBack={()=>setView("board")}
          />
        )}
      </div>

      {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
    </div>
  );
}

function BoardView({assignments,submissions,onOpen}) {
  return (
    <div>
      <header style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:12,letterSpacing:3,textTransform:"uppercase",color:"#7f8c8d",marginBottom:6,fontFamily:"'Architects Daughter',cursive"}}>
          Class Assignment Board
        </div>
        <h1 style={{fontFamily:"'Architects Daughter',cursive",fontSize:30,color:"#1a1a2e",borderBottom:"3px solid #1a1a2e",display:"inline-block",paddingBottom:4}}>
          Assignments
        </h1>
        <p style={{color:"#888",fontSize:14,marginTop:8}}>Click an assignment to view details & submit your work.</p>
      </header>

      {assignments.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:"#aaa",border:"2px dashed #ccc",borderRadius:8,background:"#fff"}}>
          <div style={{fontSize:48,marginBottom:12}}>📭</div>
          <div style={{fontFamily:"'Architects Daughter',cursive",fontSize:18,color:"#bbb"}}>No assignments yet.</div>
          <div style={{fontSize:14,marginTop:6}}>An officer will post one soon.</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {assignments.map((a,i)=>{
            const dl=a.deadline?daysLeft(a.deadline):null;
            const subCount=(submissions[a.id]||[]).length;
            return (
              <button key={a.id} onClick={()=>onOpen(a)} style={{
                background:"#fff",border:"2px solid #1a1a2e",borderRadius:4,
                boxShadow:"4px 4px 0 #1a1a2e",padding:0,cursor:"pointer",textAlign:"left",
                animation:`fadeIn .3s ease ${i*0.05}s both`
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #1a1a2e";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #1a1a2e";}}
              >
                <div style={{background:"#1a1a2e",color:"#fff",padding:"10px 18px",fontFamily:"'Architects Daughter',cursive",fontSize:17,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{a.title}</span>
                  <span style={{fontSize:12,background:"#e74c3c",padding:"2px 10px",borderRadius:20,fontFamily:"'Patrick Hand',cursive"}}>{a.subject||"Assignment"}</span>
                </div>
                <div style={{padding:"12px 18px 14px"}}>
                  <p style={{fontSize:14,color:"#555",lineHeight:1.6,marginBottom:10}}>
                    {a.description.length>120?a.description.slice(0,120)+"…":a.description}
                  </p>
                  <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13}}>
                    {a.deadline&&<span style={{color:dl.color,fontWeight:"bold"}}>🗓 {fmt(a.deadline)} · {dl.label}</span>}
                    <span style={{color:"#888"}}>📤 {subCount} submission{subCount!==1?"s":""}</span>
                    {a.image&&<span style={{color:"#888"}}>🖼 Has image</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoginView({onLogin,onBack}) {
  const [user,setUser]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");

  const attempt=()=>{
    if(user===OFFICER_USERNAME&&pass===OFFICER_PASSWORD){onLogin();}
    else{setErr("Wrong username or password.");setPass("");}
  };

  return (
    <div style={{maxWidth:400,margin:"40px auto"}}>
      <div style={{background:"#fff",border:"2px solid #1a1a2e",borderRadius:4,boxShadow:"5px 5px 0 #1a1a2e",overflow:"hidden"}}>
        <div style={{background:"#1a1a2e",color:"#fff",padding:"12px 20px",fontFamily:"'Architects Daughter',cursive",fontSize:18}}>
          🔐 Officer Login
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={lbl}>Username</label>
            <input value={user} onChange={e=>setUser(e.target.value)} placeholder="officer username" style={inp} onKeyDown={e=>e.key==="Enter"&&attempt()} />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e=>e.key==="Enter"&&attempt()} />
          </div>
          {err&&<p style={{color:"#e74c3c",fontSize:13}}>⚠ {err}</p>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={attempt} style={btnP}>Log in</button>
            <button onClick={onBack} style={btnG}>Cancel</button>
          </div>
          <p style={{fontSize:12,color:"#aaa"}}>Only class officers can post assignments.</p>
        </div>
      </div>
    </div>
  );
}

function CreateView({onSave,onBack}) {
  const [title,setTitle]=useState("");
  const [subject,setSubject]=useState("");
  const [desc,setDesc]=useState("");
  const [deadline,setDeadline]=useState("");
  const [image,setImage]=useState(null);
  const [imgName,setImgName]=useState("");
  const fileRef=useRef();

  const handleImg=(e)=>{
    const file=e.target.files[0];if(!file)return;
    setImgName(file.name);
    const r=new FileReader();r.onload=ev=>setImage(ev.target.result);r.readAsDataURL(file);
  };

  const save=()=>{
    if(!title.trim()||!desc.trim())return;
    onSave({id:Date.now().toString(),title:title.trim(),subject:subject.trim()||"Assignment",description:desc.trim(),deadline:deadline||null,image:image||null,postedAt:new Date().toISOString()});
  };

  return (
    <div style={{maxWidth:600,margin:"0 auto"}}>
      <div style={{background:"#fff",border:"2px solid #1a1a2e",borderRadius:4,boxShadow:"5px 5px 0 #1a1a2e",overflow:"hidden"}}>
        <div style={{background:"#1a1a2e",color:"#fff",padding:"12px 20px",fontFamily:"'Architects Daughter',cursive",fontSize:18}}>
          ✏️ Post New Assignment
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"flex",gap:12}}>
            <div style={{flex:2}}>
              <label style={lbl}>Assignment Title *</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Research Paper on WW2" style={inp} />
            </div>
            <div style={{flex:1}}>
              <label style={lbl}>Subject</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. History" style={inp} />
            </div>
          </div>
          <div>
            <label style={lbl}>Description *</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Explain the assignment — requirements, format, page count, etc." rows={5} style={{...inp,resize:"vertical"}} />
          </div>
          <div>
            <label style={lbl}>Deadline</label>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Attach Image (optional)</label>
            <button onClick={()=>fileRef.current.click()} style={{...btnG,width:"100%",justifyContent:"center",padding:"10px 0"}}>
              {imgName?`📎 ${imgName}`:"📎 Upload image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg} />
            {image&&<img src={image} alt="preview" style={{marginTop:10,width:"100%",borderRadius:6,border:"1.5px solid #ddd",maxHeight:200,objectFit:"cover"}} />}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={save} disabled={!title.trim()||!desc.trim()} style={{...btnP,opacity:(!title.trim()||!desc.trim())?0.5:1}}>Post Assignment</button>
            <button onClick={onBack} style={btnG}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailView({asgn,subs,isOfficer,onSubmit,onDelete,onBack}) {
  const [name,setName]=useState("");
  const [text,setText]=useState("");
  const [image,setImage]=useState(null);
  const [imgName,setImgName]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [confirmDel,setConfirmDel]=useState(false);
  const fileRef=useRef();
  const dl=asgn.deadline?daysLeft(asgn.deadline):null;

  const handleImg=(e)=>{
    const file=e.target.files[0];if(!file)return;
    setImgName(file.name);
    const r=new FileReader();r.onload=ev=>setImage(ev.target.result);r.readAsDataURL(file);
  };

  const submit=()=>{
    if(!name.trim()||(!text.trim()&&!image))return;
    onSubmit({id:Date.now().toString(),name:name.trim(),text:text.trim(),image:image||null,submittedAt:new Date().toISOString()});
    setSubmitted(true);setName("");setText("");setImage(null);setImgName("");
  };

  return (
    <div>
      <button onClick={onBack} style={{...btnG,marginBottom:20,fontSize:13}}>← Back to board</button>

      <div style={{background:"#fff",border:"2px solid #1a1a2e",borderRadius:4,boxShadow:"5px 5px 0 #1a1a2e",overflow:"hidden",marginBottom:28}}>
        <div style={{background:"#1a1a2e",color:"#fff",padding:"12px 18px",fontFamily:"'Architects Daughter',cursive",fontSize:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>{asgn.title}</span>
          <span style={{fontSize:12,background:"#e74c3c",padding:"2px 10px",borderRadius:20,fontFamily:"'Patrick Hand',cursive"}}>{asgn.subject}</span>
        </div>
        {asgn.image&&<img src={asgn.image} alt="assignment" style={{width:"100%",maxHeight:280,objectFit:"cover"}} />}
        <div style={{padding:"16px 20px"}}>
          <p style={{fontSize:15,color:"#333",lineHeight:1.8,marginBottom:14}}>{asgn.description}</p>
          <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:13,color:"#666",borderTop:"1px dashed #ddd",paddingTop:12}}>
            {asgn.deadline&&<span style={{color:dl.color,fontWeight:"bold"}}>🗓 Due: {fmt(asgn.deadline)} · {dl.label}</span>}
            <span>📤 {subs.length} submission{subs.length!==1?"s":""}</span>
            <span>📌 Posted {fmt(asgn.postedAt)}</span>
          </div>
        </div>
        {isOfficer&&(
          <div style={{padding:"0 20px 16px",borderTop:"1px dashed #eee"}}>
            {!confirmDel?(
              <button onClick={()=>setConfirmDel(true)} style={{background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:13,fontFamily:"'Patrick Hand',cursive",marginTop:10}}>
                🗑 Delete Assignment
              </button>
            ):(
              <div style={{display:"flex",gap:10,alignItems:"center",marginTop:10}}>
                <span style={{fontSize:13,color:"#e74c3c"}}>Delete permanently?</span>
                <button onClick={onDelete} style={{...btnP,background:"#e74c3c",fontSize:13,padding:"5px 14px"}}>Yes, delete</button>
                <button onClick={()=>setConfirmDel(false)} style={{...btnG,fontSize:13,padding:"5px 14px"}}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{background:"#fff",border:"2px solid #1a1a2e",borderRadius:4,boxShadow:"5px 5px 0 #1a1a2e",overflow:"hidden",marginBottom:28}}>
        <div style={{background:"#2c3e50",color:"#fff",padding:"10px 18px",fontFamily:"'Architects Daughter',cursive",fontSize:16}}>
          📤 Submit Your Work
        </div>
        {submitted?(
          <div style={{padding:28,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:10}}>🎉</div>
            <p style={{fontFamily:"'Architects Daughter',cursive",fontSize:18,color:"#27ae60"}}>Submitted successfully!</p>
            <button onClick={()=>setSubmitted(false)} style={{...btnG,margin:"14px auto 0",fontSize:13}}>Submit another</button>
          </div>
        ):(
          <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={lbl}>Your Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={inp} />
            </div>
            <div>
              <label style={lbl}>Text / Answer</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type your answer, notes, or link here…" rows={4} style={{...inp,resize:"vertical"}} />
            </div>
            <div>
              <label style={lbl}>Upload Image (optional)</label>
              <button onClick={()=>fileRef.current.click()} style={{...btnG,width:"100%",justifyContent:"center",padding:"9px 0"}}>
                {imgName?`📎 ${imgName}`:"📎 Attach image"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg} />
              {image&&<img src={image} alt="preview" style={{marginTop:8,width:"100%",borderRadius:6,border:"1.5px solid #ddd",maxHeight:180,objectFit:"cover"}} />}
            </div>
            <button onClick={submit} disabled={!name.trim()||(!text.trim()&&!image)} style={{...btnP,opacity:(!name.trim()||(!text.trim()&&!image))?0.5:1}}>
              Submit
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 style={{fontFamily:"'Architects Daughter',cursive",fontSize:18,color:"#1a1a2e",marginBottom:14,borderLeft:"4px solid #e74c3c",paddingLeft:10}}>
          Submissions ({subs.length})
        </h2>
        {subs.length===0?(
          <p style={{color:"#aaa",fontSize:14,padding:"20px 0"}}>No submissions yet. Be the first!</p>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {subs.map((s,i)=>(
              <div key={s.id} style={{background:"#fff",border:"1.5px solid #ddd",borderRadius:6,overflow:"hidden",animation:`fadeIn .3s ease ${i*0.04}s both`}}>
                <div style={{background:"#f8f8f8",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #eee"}}>
                  <span style={{fontFamily:"'Architects Daughter',cursive",fontSize:15,color:"#1a1a2e"}}>{s.name}</span>
                  <span style={{fontSize:12,color:"#aaa"}}>{fmt(s.submittedAt)}</span>
                </div>
                <div style={{padding:"12px 16px"}}>
                  {s.text&&<p style={{fontSize:14,color:"#333",lineHeight:1.7,marginBottom:s.image?10:0}}>{s.text}</p>}
                  {s.image&&<img src={s.image} alt="submission" style={{width:"100%",borderRadius:6,maxHeight:260,objectFit:"cover"}} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inp={width:"100%",padding:"9px 12px",border:"1.5px solid #ccc",borderRadius:6,fontSize:14,fontFamily:"'Patrick Hand',cursive",outline:"none",background:"#fffef5",color:"#1a1a2e"};
const lbl={fontSize:13,color:"#666",display:"block",marginBottom:4};
const btnP={background:"#1a1a2e",color:"#fff",border:"none",borderRadius:6,padding:"10px 22px",cursor:"pointer",fontFamily:"'Patrick Hand',cursive",fontSize:15,fontWeight:"bold"};
const btnG={background:"#f5f5f5",color:"#1a1a2e",border:"1.5px solid #ccc",borderRadius:6,padding:"10px 22px",cursor:"pointer",fontFamily:"'Patrick Hand',cursive",fontSize:15,display:"flex",alignItems:"center",gap:6};
const navBtn={background:"none",color:"#fff",border:"1.5px solid rgba(255,255,255,0.4)",borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"'Patrick Hand',cursive",fontSize:14};
