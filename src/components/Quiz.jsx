import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

const API_URL =
  "https://api.allorigins.win/get?url=https://api.jsonserve.com/Uw5CrX";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

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
    } else if (timer === 0 && !selectedAnswers[answeredCount]) {
      setIsTimerRunning(false);
    }
  }, [isTimerRunning, timer, answeredCount, selectedAnswers]);

  // Start Quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setIsTimerRunning(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
    setShowAnswer(true);
  };

  // Handle question completion and scoring
  const handleNextQuestion = () => {
    if (!selectedAnswers[answeredCount]) return;

    const currentQuestion = questions[answeredCount];
    if (!currentQuestion) return;

    const selectedAnswer = selectedAnswers[answeredCount];
    const correctAnswer = currentQuestion.options.find(
      (option) => option.is_correct
    )?.description;

    if (selectedAnswer === correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (answeredCount + 1 === questions.length) {
      setShowResults(true);
      setIsTimerRunning(false);
    } else {
      setAnsweredCount((prev) => prev + 1);
      setTimer(30);
      setIsTimerRunning(true);
      setShowAnswer(false);
    }
  };
  // Restart the quiz
  const resetQuiz = () => {
    setQuizStarted(false);
    setSelectedAnswers({});
    setTimer(30);
    setAnsweredCount(0);
    setScore(0);
    setShowResults(false);
    setShowAnswer(false);
    setIsTimerRunning(false);
  };

  // Get cheerful message if no correct answers
  const getCheerfulMessage = (score, totalQuestions) => {
    if (score === 0) {
      return "Don't worry! Every expert was once a beginner. Try again and you'll do better! 🚀💡";
    }
    return `Great job! You scored ${score} out of ${totalQuestions}. Keep improving! 🎯🔥`;
  };

  // Generate report card for analysis
  const generateReportCard = () => {
    return questions.map((question, index) => {
      const userAnswer = selectedAnswers[index];
      const correctAnswer = question.options.find(
        (option) => option.is_correct
      )?.description;
      const isCorrect = userAnswer === correctAnswer;

      return (
        <div key={index} className="report-card-item">
          <p>
            <strong>
              Q{index + 1}: {question.description}
            </strong>
          </p>
          <p>
            <strong>Your Answer:</strong>
            <span className={isCorrect ? "correct-answer" : "wrong-answer"}>
              {userAnswer}
            </span>
          </p>
          <p>
            <strong>Correct Answer:</strong>
            <span className="correct-answer">{correctAnswer}</span>
          </p>
        </div>
      );
    });
  };

  const progress = questions.length
    ? ((answeredCount + (showResults ? 1 : 0)) / questions.length) * 100
    : 0;

  return (
    <div className="quiz-container">
      <h2>Quiz App</h2>

      {loading ? (
        <p>Loading...</p>
      ) : !quizStarted ? (
        // Show start screen before quiz begins
        <div className="start-screen">
          <h3>Welcome to the Quiz</h3>
          <button className="start-button" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      ) : !showResults ? (
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
              <strong>{questions[answeredCount].description}</strong>
              <ul>
                {questions[answeredCount].options.map((option, optionIndex) => {
                  const isCorrect = option.is_correct;
                  const isSelected =
                    selectedAnswers[answeredCount] === option.description;

                  return (
                    <li
                      key={optionIndex}
                      className={
                        showAnswer
                          ? isCorrect
                            ? "correct-answer"
                            : isSelected
                            ? "wrong-answer"
                            : "option"
                          : "option"
                      }
                    >
                      <label>
                        <input
                          type="radio"
                          name={`question-${answeredCount}`}
                          value={option.description}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerSelect(
                              answeredCount,
                              option.description
                            )
                          }
                          disabled={showAnswer}
                        />
                        {option.description}
                      </label>
                    </li>
                  );
                })}
              </ul>

              {/* Next Question Button */}
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[answeredCount]}
              >
                {answeredCount + 1 === questions.length
                  ? "Finish Quiz"
                  : "Next Question"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        // Show Results and Report Card
        <div className="results">
          <h3>Quiz Completed!</h3>
          <p>
            Your total score: {score}/{questions.length}
          </p>
          <p className="cheerful-message">
            {getCheerfulMessage(score, questions.length)}
          </p>
          <div className="report-card">
            <h4>Your Report Card:</h4>
            {generateReportCard()}
          </div>
          <button onClick={resetQuiz}>Restart Quiz</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
