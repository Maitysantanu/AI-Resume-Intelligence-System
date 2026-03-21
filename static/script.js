const API = "http://127.0.0.1:8000";

/* =========================
Toggle admin key for login
========================= */

function toggleAdminKeyLogin(){

let role = document.getElementById("login_role").value;
let box = document.getElementById("admin_key_login_box");

box.style.display = (role === "hr") ? "block" : "none";

}


/* =========================
SIGNUP
========================= */
async function signup(){

let email = document.getElementById("signup_email").value.trim();
let password = document.getElementById("signup_password").value.trim();
let role = document.getElementById("signup_role").value;

if(!email || !password){
alert("Please fill all fields");
return;
}

let url = role === "hr" ? "/signup-hr/" : "/signup-user/";

let form = new FormData();
form.append("email", email);
form.append("password", password);

try{

let res = await fetch(API + url, {
method: "POST",
body: form
});

let data = await res.json();
console.log("SIGNUP RESPONSE:", data);

if(res.ok && data.message){

alert(data.message);

}else{

alert(data.error || data.detail || "Signup failed");

}

}catch(error){

console.error(error);
alert("Server error");

}

}
/* =========================
GO TO LOGIN
========================= */

function goToLogin(){

window.location.href="/static/login.html";

}
/* =========================
LOGIN
========================= */

async function login(){

let email = document.getElementById("login_email").value.trim().toLowerCase();
let password = document.getElementById("login_password").value.trim();
let role = document.getElementById("login_role").value;

let adminKeyInput = document.getElementById("login_admin_key");

if(!email || !password){
alert("Enter email and password");
return;
}

let form = new FormData();
form.append("email", email);
form.append("password", password);

if(role === "hr"){

let adminKey = adminKeyInput ? adminKeyInput.value.trim() : "";

if(!adminKey){
alert("Please enter admin key");
return;
}

form.append("admin_key", adminKey);

}

let url = role === "hr" ? "/login-hr/" : "/login-user/";

try{

let res = await fetch(API + url, {
method: "POST",
body: form
});

let text = await res.text();
console.log("RAW RESPONSE:", text);

let data;
try {
    data = JSON.parse(text);
} catch {
    alert("Invalid server response");
    return;
}

console.log("PARSED DATA:", data);

if(res.ok && data.role === "user"){
window.location.href = "/static/dashboard_user.html";
}
else if(res.ok && data.role === "hr"){
window.location.href = "/static/dashboard_hr.html";
}
else{
alert(data.error || data.detail || "Login failed");
}

}catch(error){

console.error(error);
alert("Server error");

}

}

/* =========================
PREDICT ROLE
========================= */
async function predictRole(){

console.log("Predict button clicked");

try{

let res = await fetch(API + "/predict-role/");

console.log("Response received:", res);

let data = await res.json();

console.log("Data received:", data);


if(res.ok && !data.error){

let output = "";

output += "Name: " + (data.name || "Unknown") + "\n";
output += "Email: " + (data.email || "Unknown") + "\n\n";

output += "Best Predicted Role: " + data.best_role + "\n\n";

output += "Top Roles:\n";

if(data.predicted_roles){
data.predicted_roles.forEach(role=>{
output += role.role + " - " + role.score + "%\n";
});
}

output += "\nMissing Skills:\n";
output += (data.missing_skills || []).join(", ");

document.getElementById("result").innerText = output;

}else{

console.log("Error from backend:", data);
document.getElementById("result").innerText = data.error || "Prediction failed";

}

}catch(error){

console.error("JS Error:", error);
alert("Server error");

}

}

/* =========================
ATS SCORE ANALYSIS
========================= */

async function atsScore(){

try{

let res = await fetch(API + "/ats-score/");
let data = await res.json();


if(!res.ok){
document.getElementById("result").innerText = data.error;
return;
}

let text = data.result;
console.log("FULL RESPONSE:", data);
console.log("RAW TEXT:", text);


/* Extract ATS score */
let score = data.score || 0;

/* Extract sections */

function extractSection(title){

let regex = new RegExp(title + "([\\s\\S]*?)(?=\\n[A-Z_]+:|$)", "i");
let match = text.match(regex);

return match ? match[1].trim() : "Not detected";

}

let skills = extractSection("IMPORTANT_SKILLS_DETECTED:");
let missing = extractSection("MISSING_INDUSTRY_SKILLS:");
let strengths = extractSection("STRENGTHS:");
let weaknesses = extractSection("WEAKNESSES:");
let formatting = extractSection("FORMATTING_FEEDBACK:");
let suggestions = extractSection("RESUME_IMPROVEMENT_SUGGESTIONS:");
let rewrite = extractSection("REWRITTEN_BULLET_POINTS");

/* Store original score and missing skills for comparison */
localStorage.setItem("original_ats_score", score);
localStorage.setItem("original_missing_skills", missing);
localStorage.setItem("original_skills", skills);

/* Format list */

function formatList(text){

let items = text.split("\n").filter(x=>x.trim()!="");
return items.map(i=>`<li>${i.replace(/^[-•*]/,"").trim()}</li>`).join("");

}


/* Score color */

let scoreClass = "low-score";

if(score >= 75) scoreClass = "high-score";
else if(score >= 50) scoreClass = "mid-score";


/* Render UI */

document.getElementById("result").innerHTML = `

<div class="ats-container">

<h2>ATS Resume Analysis</h2>

<div class="ats-meter">
<div class="ats-fill ${scoreClass}" style="width:${score}%"></div>
</div>

<div class="ats-score-text">
${score}% ATS Match
</div>

<div class="ats-grid">

<div class="ats-card">
<h3>Skills Detected</h3>
<ul>${formatList(skills)}</ul>
</div>

<div class="ats-card">
<h3>Missing Skills</h3>
<ul>${formatList(missing)}</ul>
</div>

<div class="ats-card">
<h3>Strengths</h3>
<ul>${formatList(strengths)}</ul>
</div>

<div class="ats-card">
<h3>Weaknesses</h3>
<ul>${formatList(weaknesses)}</ul>
</div>

<div class="ats-card">
<h3>Formatting Feedback</h3>
<ul>${formatList(formatting)}</ul>
</div>

<div class="ats-card">
<h3>Improvement Suggestions</h3>
<ul>${formatList(suggestions)}</ul>
</div>

<div class="ats-card">
<h3>Rewritten Resume Bullet Points</h3>
<ul>${formatList(rewrite)}</ul>
</div>

</div>

<div style="margin-top:30px; text-align:center;">
<p style="color:#aaa; margin-bottom:12px;">Applied the suggestions? Upload your improved resume to track your progress.</p>
<button onclick="window.location.href='/compare'" class="improve-btn">🚀 Check My Improvement</button>
</div>

</div>

`;

}catch(error){

console.error(error);
alert("Server error");

}

}


/* =========================
UPLOAD RESUME
========================= */

async function uploadResume(){

let fileInput = document.getElementById("resume");
let file = fileInput.files[0];

if(!file){
alert("Please select a resume file");
return;
}

let formData = new FormData();
formData.append("file", file);

try{

let res = await fetch(API + "/upload-resume/",{
method:"POST",
body:formData
});

let data = await res.json();

if(res.ok){

document.getElementById("result").innerHTML =
`<p style="color:lightgreen;font-weight:bold;">${data.message}</p>`;

}
else{

document.getElementById("result").innerText =
data.error || "Upload failed";

}

}catch(error){

console.error(error);
alert("Server error while uploading resume");

}

}


/* =========================
UPLOAD IMPROVED RESUME & COMPARE
========================= */

async function uploadAndCompare(){

let fileInput = document.getElementById("improved_resume");
let file = fileInput.files[0];

if(!file){
alert("Please select your improved resume PDF");
return;
}

document.getElementById("loading").style.display = "block";
document.getElementById("compare_result").innerHTML = "";

/* Step 1: Upload improved resume */
let formData = new FormData();
formData.append("file", file);

try{

let uploadRes = await fetch(API + "/upload-resume/", {
method: "POST",
body: formData
});

let uploadData = await uploadRes.json();

if(!uploadRes.ok){
alert(uploadData.error || "Upload failed");
document.getElementById("loading").style.display = "none";
return;
}

/* Step 2: Get new ATS score */
let scoreRes = await fetch(API + "/ats-score/");
let scoreData = await scoreRes.json();

document.getElementById("loading").style.display = "none";

if(!scoreRes.ok || scoreData.error){
alert(scoreData.error || "Could not analyze resume");
return;
}

/* Step 3: Get original score from localStorage */
let oldScore = parseInt(localStorage.getItem("original_ats_score") || "0");
let oldMissingRaw = localStorage.getItem("original_missing_skills") || "";
let oldSkillsRaw = localStorage.getItem("original_skills") || "";

let newScore = scoreData.score || 0;
let newText = scoreData.result || "";

/* Parse skills from new result */
function extractSection(text, title){
let regex = new RegExp(title + "([\\s\\S]*?)(?=\\n[A-Z_]+:|$)", "i");
let match = text.match(regex);
return match ? match[1].trim() : "";
}

function parseList(raw){
return raw.split("\n")
    .map(x => x.replace(/^[-•*\d.]/,"").trim())
    .filter(x => x.length > 2);
}

let newMissingRaw = extractSection(newText, "MISSING_INDUSTRY_SKILLS:");
let newSkillsRaw = extractSection(newText, "IMPORTANT_SKILLS_DETECTED:");

let oldMissing = parseList(oldMissingRaw);
let newMissing = parseList(newMissingRaw);
let newSkills = parseList(newSkillsRaw);

/* Case-insensitive fuzzy matching */
function normalize(s){ return s.toLowerCase().replace(/[^a-z0-9]/g, ""); }

let skillsAdded = oldMissing.filter(s =>
    !newMissing.some(n => normalize(n) === normalize(s))
);

let stillMissing = newMissing.filter(s =>
    oldMissing.some(o => normalize(o) === normalize(s))
);

let diff = newScore - oldScore;
let diffText = diff > 0 ? `+${diff}` : `${diff}`;
let diffColor = diff > 0 ? "#34d399" : diff < 0 ? "#f87171" : "#aaa";

/* Render comparison dashboard */
document.getElementById("compare_result").innerHTML = `

<div class="result-summary">
    ${diff > 0
        ? `🎉 Great job! Your ATS score improved by <span class="highlight">${diffText} points</span> after applying the suggestions.`
        : diff === 0
        ? `Your score stayed the same. Try applying more of the suggestions and re-upload.`
        : `Your score dropped by ${Math.abs(diff)} points. Make sure you're not removing important keywords.`
    }
</div>

<div class="score-comparison">

    <div class="score-card old">
        <h3>Original Score</h3>
        <div class="score-number old">${oldScore}%</div>
        <div class="score-label">Before Improvement</div>
    </div>

    <div class="score-card new-card">
        <h3>New Score</h3>
        <div class="score-number new">${newScore}%</div>
        <div class="score-label">After Improvement</div>
    </div>

    <div class="score-card diff">
        <h3>Change</h3>
        <div class="score-number improved">${diffText} pts</div>
        <div class="score-label">Points Gained</div>
    </div>

</div>

<div class="progress-section">
    <div class="section-title">Score Progress</div>

    <div class="bar-row">
        <div class="bar-label">
            <span>Original Resume</span>
            <span>${oldScore}%</span>
        </div>
        <div class="bar-track">
            <div class="bar-fill old-bar" style="width:${oldScore}%"></div>
        </div>
    </div>

    <div class="bar-row">
        <div class="bar-label">
            <span>Improved Resume</span>
            <span>${newScore}%</span>
        </div>
        <div class="bar-track">
            <div class="bar-fill new-bar" style="width:${newScore}%"></div>
        </div>
    </div>
</div>

<div class="skills-section">

    <div class="skills-card">
        <h3>✅ Skills You Added</h3>
        <div class="tags-wrap">
        ${skillsAdded.length > 0
            ? skillsAdded.map(s => `<span class="tag added">${s}</span>`).join("")
            : "<p class='empty-msg'>No new skills detected yet. Try adding more from the suggestions.</p>"
        }
        </div>
    </div>

    <div class="skills-card">
        <h3>⚠️ Still Missing</h3>
        <div class="tags-wrap">
        ${stillMissing.length > 0
            ? stillMissing.map(s => `<span class="tag still-missing">${s}</span>`).join("")
            : "<p class='empty-msg success'>🎉 All skill gaps addressed!</p>"
        }
        </div>
    </div>

</div>

<a href="/static/dashboard_user.html" class="back-btn">← Back to Dashboard</a>

`;

}catch(error){

console.error(error);
document.getElementById("loading").style.display = "none";
alert("Server error");

}

}


/* =========================
HR MATCH JOB DESCRIPTION
========================= */

async function matchJD(){

let jd = document.getElementById("jd").value.trim();

if(!jd){
alert("Please enter job description");
return;
}

let formData = new FormData();
formData.append("jd", jd);

try{

let res = await fetch(API + "/jd-match/",{
method:"POST",
body:formData
});

let data = await res.json();

let container = document.getElementById("result");
container.innerHTML = "";

if(!res.ok){
container.innerText = data.error || "Matching failed";
return;
}

if(data.candidates && data.candidates.length > 0){

let total = data.candidates.length;
let sum = 0;
let top = 0;

data.candidates.forEach((c, index)=>{

sum += c.score;
if(c.score > top) top = c.score;

let colorClass = "low-score";
if(c.score >= 75) colorClass = "high-score";
else if(c.score >= 50) colorClass = "mid-score";

container.innerHTML += `
<div class="candidate-card">

<h3>#${index + 1} ${c.name}</h3>

<p><b>Email:</b> ${c.email}</p>

<div class="score-bar">
<div class="score-fill ${colorClass}" style="width:${c.score}%"></div>
</div>

<p><b>Match Score:</b> ${c.score}%</p>

</div>
`;

});

let avg = (sum / total).toFixed(1);

document.getElementById("totalCount").innerText = total;
document.getElementById("avgScore").innerText = avg + "%";
document.getElementById("topScore").innerText = top + "%";

}else{

container.innerText = "No matching candidates found";

document.getElementById("totalCount").innerText = 0;
document.getElementById("avgScore").innerText = "0%";
document.getElementById("topScore").innerText = "0%";

}

}catch(error){

console.error(error);
alert("Server error while matching resumes");

}
}