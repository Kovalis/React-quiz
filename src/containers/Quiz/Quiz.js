import React, { Component } from "react";
import classes from "./Quiz.module.css";
import ActiveQuiz from "../../components/ActiveQuiz/ActiveQuiz";
import FinishedQuiz from "../../components/FinishedQuiz/FinishedQuiz";
import Loader from "../../components/UI/Loader/Loader";
import { useParams } from "react-router-dom";
import axios from "../../axios/axios-quiz";

function withRouter(Children) {
  return (props) => {
    const match = { params: useParams() };
    return <Children {...props} match={match} />;
  };
}

class Quiz extends Component {
  state = {
    results: {}, // {[id]: success error}
    isFinished: false,
    activeQuestion: 0,
    answerState: null, // { [id]: 'success' 'error' }
    // quiz: [
    //   {
    //     question: "Какого цвета небо?",
    //     rightAnswerId: 2,
    //     id: 1,
    //     answers: [
    //       { text: "Черный", id: 1 },
    //       { text: "Синий", id: 2 },
    //       { text: "Красный", id: 3 },
    //       { text: "Зеленый", id: 4 },
    //     ],
    //   },
    //   {
    //     question: "В каком году основали Санкт-Петербург?",
    //     rightAnswerId: 3,
    //     id: 2,
    //     answers: [
    //       { text: "1700", id: 1 },
    //       { text: "1702", id: 2 },
    //       { text: "1703", id: 3 },
    //       { text: "1803", id: 4 },
    //     ],
    //   },
    // ],
    quiz: [],
    loading: true,
  };

  onAnswerClickHandler = (answerId) => {
    if (this.state.answerState) {
      const key = Object.keys(this.state.answerState)[0];
      if (this.state.answerState[key] === "success") {
        return;
      }
    }

    const question = this.state.quiz[this.state.activeQuestion];
    const results = this.state.results;

    if (question.rightAnswerId === answerId) {
      if (!results[question.id]) {
        results[question.id] = "success";
      }

      this.setState({
        answerState: { [answerId]: "success" },
        results,
      });

      const timeOut = window.setTimeout(() => {
        if (this.isQuizFinished()) {
          this.setState({
            isFinished: true,
          });
          console.log("Finished");
        } else {
          this.setState({
            activeQuestion: this.state.activeQuestion + 1,
            answerState: null,
          });
        }

        window.clearTimeout(timeOut);
      }, 1000);
    } else {
      results[question.id] = "error";
      this.setState({
        answerState: { [answerId]: "error" },
        results,
      });
    }
  };

  isQuizFinished() {
    return this.state.activeQuestion + 1 === this.state.quiz.length;
  }

  retryHandler = () => {
    this.setState({
      activeQuestion: 0,
      answerState: null,
      isFinished: false,
      results: {},
    });
  };

  async componentDidMount() {
    console.log(this.props.match.params.id);
    try {
      const response = await axios.get(
        `/quizes/${this.props.match.params.id}.json`
      );
      //console.log(response);
      const quiz = response.data;

      this.setState({
        quiz,
        loading: false,
      });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <div className={classes.Quiz}>
        <div className={classes.QuizWrapper}>
          <h1>Ответьте на все вопросы</h1>

          {this.state.loading ? (
            <Loader />
          ) : this.state.isFinished ? (
            <FinishedQuiz
              results={this.state.results}
              quiz={this.state.quiz}
              onRetry={this.retryHandler}
            />
          ) : (
            <ActiveQuiz
              answers={this.state.quiz[this.state.activeQuestion].answers}
              question={this.state.quiz[this.state.activeQuestion].question}
              onAnswerClick={this.onAnswerClickHandler}
              quizLength={this.state.quiz.length}
              answerNumber={this.state.activeQuestion + 1}
              state={this.state.answerState}
            />
          )}
        </div>
      </div>
    );
  }
}

//export default Quiz;
export default withRouter(Quiz);
