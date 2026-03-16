const BUZZWORDS = [
    "AI","Artificial Intelligence","Generative AI","GenAI","AI Powered","AI Driven",
    "AI Enabled","AI First","AI Native","AI Assistant","AI Copilot","AI Tool",
    "AI Platform","AI Solution","AI Product","AI Automation","AI Workflow",
    "AI Productivity","AI Insights","AI Strategy","AI Transformation",
    "Digital Transformation","Enterprise AI","AI Innovation","AI Revolution",
    "AI Breakthrough","Next Gen AI","AI Startup","AI Founder","AI Builder",
    "AI Creator","AI Community","AI Ecosystem","AI Network","AI Future",
    "Future of Work","Future of AI","AI Opportunity","AI Impact","AI Growth",
    "AI Scaling","AI Adoption","AI Integration","AI Content","AI Creativity",
    "AI Storytelling","AI Marketing","AI Sales","AI Recruiting","AI Learning",
    "AI Education","AI Skills","AI Leadership","AI Mindset","AI Vision",
    "AI Momentum","AI Movement","AI Wave","AI Trends","AI Insights",
    "AI Updates","AI Thinking","AI Driven Culture","AI Powered Teams"
];

const SKIP_TAGS = new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT","CODE","PRE"]);

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function buzzwordOrGeneric(){ return Math.random() < 0.2 ? random(BUZZWORDS) : "BUZZWORD"; }

function shouldSkip(node){
    const parent = node.parentElement;
    if(!parent) return true;
    if(SKIP_TAGS.has(parent.tagName)) return true;
    return parent.isContentEditable;

}

function replaceTextNodes(root){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while(node = walker.nextNode()){
        if(node.__ai_done) continue;
        if(shouldSkip(node)) continue;
        const text = node.nodeValue.trim();
        if(text.length < 3) continue;
        node.nodeValue = buzzwordOrGeneric();
        node.__ai_done = true;
    }
}

function replaceImages(root, LOGOS){
    if(!root.querySelectorAll) return;
    const imgs = root.querySelectorAll("img:not([data-ai-replaced])");
    for(const img of imgs){
        try{
            if(!img.src) continue;
            if(img.src.startsWith("data:image/svg")) continue; // skip inline SVGs
            img.src = random(LOGOS);
            img.dataset.aiReplaced = "1";
        }catch(e){}
    }
}

function process(root, LOGOS){
    if(!root || !root.isConnected) return;
    replaceTextNodes(root);
    replaceImages(root, LOGOS);
}

// Queue for batching
const queue = new Set();
let scheduled = false;

function schedule(LOGOS){
    if(scheduled) return;
    scheduled = true;
    const run = ()=>{
        for(const node of queue) process(node, LOGOS);
        queue.clear();
        scheduled = false;
    };
    if("requestIdleCallback" in window) requestIdleCallback(run);
    else setTimeout(run, 40);
}

function enqueue(node, LOGOS){
    if(!node || node.nodeType !== 1) return;
    queue.add(node);
    schedule(LOGOS);
}

// Wait for page load
window.addEventListener("load", ()=>{
    const LOGOS = [
        chrome.runtime.getURL("logos/chatgpt.png"),
        chrome.runtime.getURL("logos/anthropic.png"),
        chrome.runtime.getURL("logos/claude.png"),
        chrome.runtime.getURL("logos/deepseek.png"),
        chrome.runtime.getURL("logos/grok.png"),
        chrome.runtime.getURL("logos/midjourney.png"),
        chrome.runtime.getURL("logos/perplexity.png")
    ];

    // Initial replacement of entire page
    process(document.body, LOGOS);

    // Observe all new nodes dynamically
    const observer = new MutationObserver(mutations=>{
        for(const mutation of mutations){
            for(const node of mutation.addedNodes){
                if(!node.isConnected) continue;
                enqueue(node, LOGOS);
            }
        }
    });

    observer.observe(document.body, { childList:true, subtree:true });
});