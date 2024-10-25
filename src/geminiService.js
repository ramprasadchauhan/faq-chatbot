import { GoogleGenerativeAI } from "@google/generative-ai";
import faqData from "./faqQuestion.json";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getFAQResponse(question) {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro", generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.8,
    }
  });
  function formatCompanyData(data) {
    let result = '';

    for (const key in data) {
      if (Array.isArray(data[key])) {
        result += `${key}:\n`;
        data[key].forEach(item => {
          if (typeof item === 'object') {
            for (const subKey in item) {
              result += `  - ${subKey}: ${item[subKey]}\n`;
            }
          } else {
            result += `  - ${item}\n`;
          }
        });
      } else if (typeof data[key] === 'object') {
        result += `${key}:\n`;
        for (const subKey in data[key]) {
          if (Array.isArray(data[key][subKey])) {
            result += `  - ${subKey}:\n`;
            data[key][subKey].forEach(service => {
              if (typeof service === 'object') {
                for (const innerKey in service) {
                  result += `    - ${innerKey}: ${service[innerKey]}\n`;
                }
              } else {
                result += `    - ${service}\n`;
              }
            });
          } else {
            // Handle cases where subKey is an object (like hours_of_operation)
            if (typeof data[key][subKey] === 'object') {
              result += `  - ${subKey}:\n`;
              for (const hourKey in data[key][subKey]) {
                result += `    - ${hourKey}: ${data[key][subKey][hourKey]}\n`;
              }
            } else {
              result += `  - ${subKey}: ${data[key][subKey]}\n`;
            }
          }
        }
      } else {
        result += `${key}: ${data[key]}\n`;
      }
    }

    return result;
  }
  const formattedCompanyData = formatCompanyData(faqData?.companyData);
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

${faqData.questionData.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}
${formattedCompanyData}
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


