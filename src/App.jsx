// import { useState, useRef, useEffect } from "react";
// import { IoIosSend } from "react-icons/io";
// import { FaMicrophone, FaStopCircle } from "react-icons/fa";
// import { HiOutlineSpeakerWave } from "react-icons/hi2";
// import { getFAQResponse } from "./geminiService";
// import { useSpeechSynthesis } from "react-speech-kit";
// import ReactMarkdown from "react-markdown";

// const App = () => {
//   const [question, setQuestion] = useState("");
//   const [chatHistory, setChatHistory] = useState([
//     { sender: "bot", text: "Welcome to the LoanBot 👋. How can I assist you?" },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
//   const [recognition, setRecognition] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState(null);
//   const messagesEndRef = useRef(null);
//   const { speak, cancel } = useSpeechSynthesis();

//   const [suggestedQuestions, setSuggestedQuestions] = useState([
//     "What are the requirements for a personal loan?",
//     "How can I apply for a mortgage?",
//     "What is the interest rate for commercial loans?",
//     "What is the minimum loan amount for personal loans?",
//     "How does Simplified Lending support the community?",
//     "Do I need a down payment for my loan?",
//     "Can I use a personal loan to start a business?",
//     "What is the maximum loan term for personal loans?",
//     "What is the maximum loan amount for commercial loans?",
//   ]);

//   useEffect(() => {
//     if ("webkitSpeechRecognition" in window) {
//       const SpeechRecognition =
//         window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.continuous = false;
//       recognitionInstance.interimResults = false;
//       recognitionInstance.lang = "en-US";

//       recognitionInstance.onstart = () => setIsMicrophoneActive(true);
//       recognitionInstance.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setQuestion(transcript);
//       };
//       recognitionInstance.onend = () => setIsMicrophoneActive(false);
//       recognitionInstance.onerror = (event) => {
//         console.error("Speech recognition error:", event);
//         setIsMicrophoneActive(false);
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       console.warn("Speech recognition is not supported in this browser.");
//     }
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   const handleInputChange = (e) => setQuestion(e.target.value);
//   const handleMicrophoneClick = () => {
//     if (recognition) {
//       recognition.start();
//     } else {
//       alert("Speech recognition is not supported in this browser.");
//     }
//   };

//   const handleStopSpeaking = () => {
//     cancel();
//     setIsSpeaking(false);
//     setCurrentlySpeakingIndex(null);
//   };

//   const handleSpeakerClick = (index, text) => {
//     if (currentlySpeakingIndex === index) {
//       handleStopSpeaking();
//     } else {
//       speak({ text });
//       setIsSpeaking(true);
//       setCurrentlySpeakingIndex(index);
//     }
//   };

//   const handleSendMessage = async (e, questionToSend) => {
//     if (e) e.preventDefault(); // Prevent default only if the event is passed
//     const text = questionToSend || question; // Use the passed question or the current state
//     if (text.trim()) {
//       setQuestion(""); // Clear the input if it's from user input
//       setLoading(true);
//       setChatHistory((prev) => [...prev, { sender: "user", text }]);
//       const response = await getFAQResponse(text);
//       setChatHistory((prev) => [...prev, { sender: "bot", text: response }]);
//       speak({ text: response });
//       setIsSpeaking(true);
//       setCurrentlySpeakingIndex(chatHistory.length);
//       setLoading(false);
//     }
//   };

//   const handleSuggestionClick = (suggestion) => {
//     handleSendMessage(null, suggestion); // Pass the suggestion directly
//   };

//   return (
//     <div className="w-full mx-auto flex flex-col body-bg">
//       <div
//         className="max-w-[1200px] w-full mx-auto flex flex-col"
//         style={{ height: "calc(75vh - 80px)", overflowY: "scroll" }}
//       >
//         <h1 className="text-2xl font-extrabold my-4 ml-4"> LOANBOT </h1>
//         <div className="flex-1 p-4 space-y-2">
//           {chatHistory.map((chat, index) => (
//             <div
//               key={index}
//               className={`flex w-full ${
//                 chat.sender === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`flex gap-2 items-start ${
//                   chat.sender === "user" ? "flex-row-reverse" : "flex-row"
//                 }`}
//               >
//                 <img
//                   src={
//                     chat.sender === "user"
//                       ? "https://static.vecteezy.com/system/resources/previews/004/819/327/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg"
//                       : "https://png.pngtree.com/png-vector/20230225/ourmid/pngtree-smart-chatbot-cartoon-clipart-png-image_6620453.png"
//                   }
//                   alt={chat.sender === "user" ? "User" : "Bot"}
//                   className="w-8 h-8 rounded-full"
//                 />
//                 {chat.sender === "bot" ? (
//                   <div className="flex ">
//                     <div
//                       className={`p-2 bg-white text-gray-800 font-[400] rounded-t-xl rounded-br-xl`}
//                     >
//                       <ReactMarkdown>{chat.text}</ReactMarkdown>
//                     </div>
//                     <div className="flex items-center self-start">
//                       <button
//                         onClick={() => handleSpeakerClick(index, chat.text)}
//                         className="hover:bg-white rounded-full p-2"
//                       >
//                         {currentlySpeakingIndex === index ? (
//                           <FaStopCircle className="text-xl" />
//                         ) : (
//                           <HiOutlineSpeakerWave className="text-xl" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className={`p-2 bg-green-200 text-black ml-3 rounded-t-xl rounded-bl-xl`}
//                   >
//                     <ReactMarkdown>{chat.text}</ReactMarkdown>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>
//       <div className="max-w-[1200px] w-full mx-auto flex flex-col">
//         <div className="mt-4 w-full flex gap-2 flex-wrap justify-center">
//           {suggestedQuestions.map((suggestion, index) => (
//             <button
//               key={index}
//               onClick={() => handleSuggestionClick(suggestion)}
//               className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
//             >
//               {suggestion}
//             </button>
//           ))}
//         </div>
//         <div className="sticky bottom-0 p-4">
//           <div className="flex items-center relative">
//             <textarea
//               type="text"
//               value={question}
//               onChange={handleInputChange}
//               placeholder="Ask a question..."
//               className="w-full text-gray-200 p-4 pl-10 pr-24 border border-gray-300 bg-[#002b17] rounded-full focus:outline-none resize-none"
//               rows="1"
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={loading}
//               className="p-2 absolute right-6 text-yellow-400 hover:bg-black/40 text-2xl rounded-full"
//             >
//               {loading ? <FaStopCircle /> : <IoIosSend />}
//             </button>
//             <button
//               onClick={handleMicrophoneClick}
//               className="p-2 absolute right-8 mr-6 text-yellow-400 text-2xl rounded-full hover:bg-black/40"
//             >
//               {isMicrophoneActive ? <FaStopCircle /> : <FaMicrophone />}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { FaMicrophone, FaStopCircle } from "react-icons/fa";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { getFAQResponse } from "./geminiService";
import { useSpeechSynthesis } from "react-speech-kit";
import ReactMarkdown from "react-markdown";
import faqData from "./faqQuestion.json";

const App = () => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Welcome to the LoanBot 👋. How can I assist you?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const { speak, cancel } = useSpeechSynthesis();

  // const [suggestedQuestions, setSuggestedQuestions] = useState([
  //   "How can apply for a personal loan?",
  //   "How can I apply for a mortgage?",
  //   "What is the interest rate for commercial loans?",
  //   "What is the minimum loan amount for personal loans?",
  //   "How does Simplified Lending support the community?",
  //   "Do I need a down payment for my loan?",
  //   "Can I use a personal loan to start a business?",
  //   "What types of insurance do you offer?",
  //   "Do you offer loans for first-time homebuyers?",
  // ]);

  const [suggestedQuestions, setSuggestedQuestions] = useState(
    faqData?.questionData?.map((item) => item?.question)
  );
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current index

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => setIsMicrophoneActive(true);
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
      };
      recognitionInstance.onend = () => setIsMicrophoneActive(false);
      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event);
        setIsMicrophoneActive(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleInputChange = (e) => setQuestion(e.target.value);

  const handleSendMessage = async (e, questionToSend) => {
    if (e) e.preventDefault(); // Prevent default only if the event is passed
    const text = questionToSend || question; // Use the passed question or the current state
    if (text.trim()) {
      setQuestion(""); // Clear the input if it's from user input
      setLoading(true);
      setChatHistory((prev) => [...prev, { sender: "user", text }]);
      const response = await getFAQResponse(text);
      setChatHistory((prev) => [...prev, { sender: "bot", text: response }]);
      speak({ text: response });
      setIsSpeaking(true);
      setCurrentlySpeakingIndex(chatHistory.length);
      setLoading(false);

      // Remove the submitted question from suggested questions
      setSuggestedQuestions((prev) => prev.filter((q) => q !== text));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(null, suggestion); // Pass the suggestion directly
  };

  const handleMicrophoneClick = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleStopSpeaking = () => {
    cancel();
    setIsSpeaking(false);
    setCurrentlySpeakingIndex(null);
  };

  const handleSpeakerClick = (index, text) => {
    if (currentlySpeakingIndex === index) {
      handleStopSpeaking();
    } else {
      speak({ text });
      setIsSpeaking(true);
      setCurrentlySpeakingIndex(index);
    }
  };

  const handleNextQuestions = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 3, suggestedQuestions.length - 3)
    );
  };

  const currentQuestions = suggestedQuestions.slice(
    currentIndex,
    currentIndex + 3
  ); // Get current set of questions

  return (
    <div className="w-full mx-auto flex flex-col body-bg">
      <div
        className="max-w-[1200px] w-full mx-auto flex flex-col"
        style={{ height: "calc(75vh - 80px)", overflowY: "scroll" }}
      >
        <h1 className="text-2xl font-extrabold my-4 ml-4"> LOANBOT </h1>
        <div className="flex-1 p-4 space-y-2">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`flex w-full ${
                chat.sender === "user" ? "justify-start ml-4" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 items-start ${
                  chat.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <img
                  src={
                    chat.sender === "user"
                      ? "https://static.vecteezy.com/system/resources/previews/004/819/327/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg"
                      : "https://png.pngtree.com/png-vector/20230225/ourmid/pngtree-smart-chatbot-cartoon-clipart-png-image_6620453.png"
                  }
                  alt={chat.sender === "user" ? "User" : "Bot"}
                  className="w-8 h-8 rounded-full"
                />
                {chat.sender === "bot" ? (
                  <div className="flex ">
                    <div
                      className={`p-2 bg-white text-gray-800 font-[400] rounded-t-xl rounded-br-xl`}
                    >
                      <ReactMarkdown>{chat.text}</ReactMarkdown>
                    </div>
                    <div className="flex items-center self-start">
                      <button
                        onClick={() => handleSpeakerClick(index, chat.text)}
                        className="hover:bg-white rounded-full p-2"
                      >
                        {currentlySpeakingIndex === index ? (
                          <FaStopCircle className="text-xl" />
                        ) : (
                          <HiOutlineSpeakerWave className="text-xl" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2 bg-green-200 text-black ml-3 rounded-t-xl rounded-bl-xl`}
                  >
                    <ReactMarkdown>{chat.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="max-w-[1200px] w-full mx-auto flex flex-col">
        <div
          className="mt-4 w-full flex gap-2 flex-wrap justify-center overflow-y-auto"
          style={{ maxHeight: "150px" }}
        >
          {currentQuestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
            >
              {suggestion}
            </button>
          ))}
          <button
            onClick={handleNextQuestions}
            disabled={currentIndex + 3 >= suggestedQuestions.length}
            className="mt-2 px-5 py-2 bg-red-400 hover:bg-red-500 text-white rounded-full"
          >
            More
          </button>
        </div>
        {/* <button
          onClick={handleNextQuestions}
          disabled={currentIndex + 3 >= suggestedQuestions.length}
          className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
        >
          Next
        </button> */}
        <div className="sticky bottom-0 p-4">
          <div className="flex items-center relative">
            <textarea
              type="text"
              value={question}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              className="w-full text-gray-200 p-4 pl-10 pr-24 border border-gray-300 bg-[#002b17] rounded-full focus:outline-none resize-none"
              rows="1"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="p-2 absolute right-6 text-yellow-400 hover:bg-black/40 text-2xl rounded-full"
            >
              {loading ? <FaStopCircle /> : <IoIosSend />}
            </button>
            <button
              onClick={handleMicrophoneClick}
              className="p-2 absolute right-8 mr-6 text-yellow-400 text-2xl rounded-full hover:bg-black/40"
            >
              {isMicrophoneActive ? <FaStopCircle /> : <FaMicrophone />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
