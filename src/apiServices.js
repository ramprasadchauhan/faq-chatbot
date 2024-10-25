import { GoogleGenerativeAI } from "@google/generative-ai";
// import faqData from "./faqQuestion.json";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const TOKEN_API_URL = `${import.meta.env.VITE_BASE_URL}/Token`;
const FAQ_API_URL = `${import.meta.env.VITE_BASE_URL}/CMS_Faqs`;
const COMPANY_API_URL = `${import.meta.env.VITE_BASE_URL}/Borrower_Operations`;

// Function to get the Bearer token
async function fetchToken() {
    try {
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
            throw new Error("Failed to fetch token");
        }

        const data = await response.json();
        return data.token; // Adjust this if token field has a different name
    } catch (error) {
        console.error("Error fetching token:", error);
        return null;
    }
}

// Function to fetch FAQ data using the token
async function fetchFAQData() {
    const token = await fetchToken();

    if (!token) return [];

    try {
        const response = await fetch(FAQ_API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch FAQ data");
        }

        const data = await response.json();
        return data.document.records;
    } catch (error) {
        console.error("Error fetching FAQ data:", error);
        return [];
    }
}

async function fetchCompanyData() {
    const token = await fetchToken();

    if (!token) return [];
    try {
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
            throw new Error("Failed to fetch company data");
        }

        const data = await response.json();
        const document = JSON.parse(data.document); // Parsing to get "Table" data
        return document.Table[0]?.Content_full || "Company data not available.";
    } catch (error) {
        console.error("Error fetching company data:", error);
        return "Company data not available.";
    }
}


export async function getFAQResponse(question) {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro", generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.8,
        }
    });

    const faqData = await fetchFAQData()
    const companyData = await fetchCompanyData();
    const prompt = `You are Simplified Bot, a friendly and helpful AI assistant for Simplified Lending, a financial services company in The Bahamas. Your goal is to provide concise and informative short answers in maximum 50-100 words to customer questions about the company and its services. Always maintain a friendly and professional tone, and ensure your responses are accurate and easy to understand.
Remember to:
Keep your answers concise and focused.
Use a friendly and approachable tone.
Be accurate and informative.

Example Interactions:

User: Hi, I'm interested in a personal loan.

Simplified Bot: Hello! I can help you with that. What kind of loan are you looking for? We offer personal loans for debt consolidation, home improvement, and more.

User: What are your mortgage rates?

Simplified Bot: Our mortgage rates are competitive and depend on various factors such as the type of mortgage, the amount borrowed, and your credit history. You can contact one of our representatives for a personalized quote.

User:  Do you offer loans to businesses?

Simplified Bot:  Yes, we do! We offer a variety of commercial loans to help businesses grow and succeed. You can learn more about our commercial loan options on our website or by contacting us directly.

${faqData.map(faq => `Q: ${faq.Faq_Que}\nA: ${faq.Faq_Ans}`).join("\n\n")}
${companyData}
If the user asks something that is a general greeting or doesn't have a direct answer in the FAQ, respond politely and offer your assistance in other ways.

For example, if the user greets you with 'hello' or 'hi', respond in a friendly manner. If the question is related to the FAQ, provide a precise answer from the data.

Now, please respond to the following question:
If you are unsure or no answer found Sorry, I couldn't find an answer to that question contact our customer care email and try to reach the contact numbers given below.

Q: ${question}
A:`;




    try {
        const result = await model.generateContentStream(prompt);
        const response = await result.response;
        return response.text(); // This returns the generated text response
    } catch (error) {
        console.error("Error generating response:", error);
        return "Sorry, I couldn't find an answer to that question.";
    }
}


