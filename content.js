const BUZZWORDS = [
    "AI",
    "Artificial Intelligence",
    "Generative AI",
    "GenAI",
    "AI Powered",
    "AI Driven",
    "AI Enabled",
    "AI First",
    "AI Native",
    "AI Assistant",
    "AI Copilot",
    "AI Tool",
    "AI Platform",
    "AI Solution",
    "AI Product",
    "AI Automation",
    "AI Workflow",
    "AI Productivity",
    "AI Insights",
    "AI Strategy",
    "AI Transformation",
    "Digital Transformation",
    "Enterprise AI",
    "AI Innovation",
    "AI Revolution",
    "AI Breakthrough",
    "Next Gen AI",
    "AI Startup",
    "AI Founder",
    "AI Builder",
    "AI Creator",
    "AI Community",
    "AI Ecosystem",
    "AI Network",
    "AI Future",
    "Future of Work",
    "Future of AI",
    "AI Opportunity",
    "AI Impact",
    "AI Growth",
    "AI Scaling",
    "AI Adoption",
    "AI Integration",
    "AI Content",
    "AI Creativity",
    "AI Storytelling",
    "AI Marketing",
    "AI Sales",
    "AI Recruiting",
    "AI Learning",
    "AI Education",
    "AI Skills",
    "AI Leadership",
    "AI Mindset",
    "AI Vision",
    "AI Momentum",
    "AI Movement",
    "AI Wave",
    "AI Trends",
    "AI Insights",
    "AI Updates",
    "AI Thinking",
    "AI Driven Culture",
    "AI Powered Teams"
]

const LOGOS = [
    chrome.runtime.getURL("logos/chatgpt.png"),
    chrome.runtime.getURL("logos/anthropic.png"),
    chrome.runtime.getURL("logos/claude.png"),
    chrome.runtime.getURL("logos/deepseek.png"),
    chrome.runtime.getURL("logos/grok.png"),
    chrome.runtime.getURL("logos/midjourney.png"),
    chrome.runtime.getURL("logos/perplexity.png")
]

function random(arr){
    return arr[Math.floor(Math.random()*arr.length)]
}

const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "INPUT",
    "CODE",
    "PRE"
])

function shouldSkip(node){
    if (!node.parentElement) return true
    if (SKIP_TAGS.has(node.parentElement.tagName)) return true
    return node.parentElement.isContentEditable;

}

function replaceTextNodes(root){
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
    )

    let node
    while(node = walker.nextNode()){
        if(node.__ai_done) continue
        if(shouldSkip(node)) continue

        const text = node.nodeValue.trim()
        if(text.length < 3) continue

        function buzzwordOrGeneric() {
            if (Math.random() < 0.2) {
                return random(BUZZWORDS)
            }
            return "BUZZWORD"
        }

        node.nodeValue = buzzwordOrGeneric()
        node.__ai_done = true
    }
}

function replaceImages(root){
    const imgs = root.querySelectorAll("img:not([data-ai-replaced])")

    for(const img of imgs){

        if(!img.src) continue

        if(img.src.includes("data:image/svg")) continue
        if(img.width < 40 && img.height < 40) continue

        img.src = random(LOGOS)
        img.dataset.aiReplaced = "1"
    }
}

function process(root){
    replaceTextNodes(root)
    replaceImages(root)
}

let scheduled = false

function scheduleProcess(node){
    if(scheduled) return
    scheduled = true

    requestIdleCallback(()=>{
        process(node || document.body)
        scheduled = false
    })
}

process(document.body)

const observer = new MutationObserver(mutations=>{
    for(const m of mutations){

        for(const node of m.addedNodes){

            if(node.nodeType !== 1) continue

            scheduleProcess(node)
        }
    }
})

observer.observe(document.body,{
    childList:true,
    subtree:true
})