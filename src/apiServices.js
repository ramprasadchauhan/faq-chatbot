import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const TOKEN_API_URL = `${import.meta.env.VITE_BASE_URL}/Token`;
const FAQ_API_URL = `${import.meta.env.VITE_BASE_URL}/CMS_Faqs?page=1&itemsPerPage=500`;
const COMPANY_API_URL = `${import.meta.env.VITE_BASE_URL}/SP/Borrower_Operations`;

// Function to get the Bearer token
async function fetchToken() {
    try {
        console.log("Fetching token...");
        const response = await fetch(TOKEN_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: import.meta.env.VITE_USERNAME,
                password: import.meta.env.VITE_PASSWORD,
            })
        });

        if (!response.ok) {
            console.error("Failed to fetch token:", response.statusText);
            throw new Error("Failed to fetch token");
        }

        const data = await response.json();
        console.log(data)
        console.log("Token fetched successfully:", data.document.AccessToken);
        return data.document.AccessToken
            ;
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
}

// Function to fetch FAQ data using the token
async function fetchFAQData() {
    const token = await fetchToken();
    if (!token) {
        console.warn("Token not available, FAQ data fetch aborted.");
        return [];
    }

    try {
        console.log("Fetching FAQ data...");
        const response = await fetch(FAQ_API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response)
        if (!response.ok) {
            console.error("Failed to fetch FAQ data:", response.statusText);
            throw new Error("Failed to fetch FAQ data");
        }

        const data = await response.json();
        console.log("FAQ data fetched successfully:", data);
        return data?.document?.records || [];
    } catch (error) {
        console.error("Error fetching FAQ data:", error);
        return [];
    }
}

// Function to fetch Company data
async function fetchCompanyData() {
    const token = await fetchToken();
    if (!token) {
        console.warn("Token not available, Company data fetch aborted.");
        return "Company data not available.";
    }

    try {
        console.log("Fetching Company data...");
        const response = await fetch(COMPANY_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                Json: JSON.stringify({ Containerid: "3" }),
                Condition: "Get_ContainerDetails",
                Type: ""
            })
        });

        if (!response.ok) {
            console.error("Failed to fetch Company data:", response.statusText);
            throw new Error("Failed to fetch Company data");
        }

        const data = await response.json();
        const document = JSON.parse(data.document); // Parsing to access "Table" data
        console.log("Company data fetched and parsed:", document);
        console.log(document.Table[0]?.Content_full)
        return document.Table[0]?.Content_full || "Company data not available.";
    } catch (error) {
        console.error("Error fetching Company data:", error);
        return "Company data not available.";
    }
}

// Function to generate a response to an FAQ question
export async function getFAQResponse(question) {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.8,
        }
    });

    try {
        console.log("Fetching FAQ and Company data for question response generation...");
        const faqData = await fetchFAQData();
        const companyData = await fetchCompanyData();

        const prompt = `
            You are Simplified Bot, a friendly and helpful AI assistant for Simplified Lending, a financial services company in The Bahamas. Your goal is to provide concise and informative answers in 50-100 words for customer questions about the company and its services. Use a friendly and professional tone.

            ${faqData.map(faq => `Q: ${faq.Faq_Que}\nA: ${faq.Faq_Ans}`).join("\n\n")}
            ${companyData}
            
            If the user asks something general or not in the FAQ, respond politely and offer assistance.
            
            Q: ${question}
            A:`;

        console.log("Prompt created:", prompt);

        const result = await model.generateContentStream(prompt);
        const response = await result.response;
        const answer = await response.text();

        console.log("Generated answer:", answer);
        return answer;
    } catch (error) {
        console.error("Error generating FAQ response:", error);
        return "Sorry, I couldn't find an answer to that question.";
    }
}
