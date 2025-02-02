import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL =
  "https://api.allorigins.win/get?url=https://api.jsonserve.com/Uw5CrX";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(30); // Timer for each question (30 seconds)
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0); // Track score
  const [showResults, setShowResults] = useState(false); // Show results at the end

  // Fetch quiz data
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        const data = JSON.parse(response.data.contents);
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((error) => console.error("API Error:", error));
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      const timerInterval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerInterval);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      // Automatically move to the next question after the timer ends (or end quiz)
      handleNextQuestion();
    }
  }, [isTimerRunning, timer]);

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
    setAnsweredCount((prev) => prev + 1);
  };

  // Handle question completion and scoring
  const handleNextQuestion = () => {
    // Increment score if the selected answer is correct
    const currentQuestion = questions[answeredCount - 1];
    const selectedAnswer = selectedAnswers[answeredCount - 1];
    const correctAnswer = currentQuestion.options.find(
      (option) => option.is_correct
    );

    if (selectedAnswer === correctAnswer.description) {
      setScore((prev) => prev + 1);
    }

    // Move to the next question
    if (answeredCount === questions.length) {
      setShowResults(true); // Show results when all questions are answered
    }
  };

  // Restart the quiz (reset all states)
  const resetQuiz = () => {
    setSelectedAnswers({});
    setTimer(30);
    setAnsweredCount(0);
    setScore(0);
    setShowResults(false);
    setIsTimerRunning(true); // Start the timer again
  };

  // Calculate progress as a percentage
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="quiz-container">
      <h2>Quiz Questions</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Timer Section */}
          <div className="timer">
            <p>Time left: {timer} seconds</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <progress value={progress} max="100"></progress>
            <p>{Math.round(progress)}% completed</p>
          </div>

          {/* Quiz Questions */}
          {answeredCount < questions.length ? (
            <div>
              <ul>
                <li>
                  <strong>{questions[answeredCount].description}</strong>
                  <ul>
                    {questions[answeredCount].options.map(
                      (option, optionIndex) => (
                        <li key={optionIndex}>
                          <label>
                            <input
                              type="radio"
                              name={`question-${answeredCount}`}
                              value={option.description}
                              checked={
                                selectedAnswers[answeredCount] ===
                                option.description
                              }
                              onChange={() =>
                                handleAnswerSelect(
                                  answeredCount,
                                  option.description
                                )
                              }
                            />
                            {option.description}
                          </label>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              </ul>

              {/* Next Question Button */}
              <button onClick={handleNextQuestion}>Next Question</button>
            </div>
          ) : (
            // Show Results
            <div className="results">
              <h3>Quiz Completed!</h3>
              <p>
                Your total score: {score}/{questions.length}
              </p>
              <button onClick={resetQuiz}>Restart Quiz</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
