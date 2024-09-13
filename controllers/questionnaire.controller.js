const { questionsTypes } = require("../helpers/constants.helper");
const { Answer, Questionnaire, Question } = require("../models");
// const { OpenAIClient } = require("../config");

module.exports = {
  getQuestionnaire: async (req, res, next) => {
    try {
      const hasAnswer = await Answer.findOne({
        user: req.uid,
        date: { $lt: Date.now() - 86400000 * 15 },
      });

      if (hasAnswer) {
        return res
          .status(401)
          .json({ msg: "Todavía no puedes responder nuevamente" });
      }

      const questionnaire = await Questionnaire.findOne({
        _id: { $ne: hasAnswer?.questionnaire },
      })
        .select("questions")
        .populate([{ path: "questions", select: "-correct_answer -guide" }])
        .lean({ virtuals: true });

      return res.send(questionnaire);
    } catch (error) {
      next(error);
    }
  },
  answerQuestionnaire: async (req, res, next) => {
    try {
      const { questions } = req.body;

      console.log({ questions });

      const format = Object.entries(questions).map(([key, value]) => ({
        id: key,
        value,
      }));

      const correctQuestions = [];

      const incorrectQuestions = [];

      let finalPoints = 0;

      await Promise.all(
        format.map(async ({ id, value }) => {
          const {
            correct_answer,
            guide: _guide,
            points,
            type,
          } = await Question.findById(id).lean();

          if (type === questionsTypes.multipleChoice) {
            if (value === correct_answer) {
              correctQuestions.push(id);
              finalPoints += points;
            } else incorrectQuestions.push(id);
          }

          if (type === questionsTypes.open) {
            incorrectQuestions.push(id);
          }
        })
      );

      const answer = new Answer({
        user: req.uid,
        questionnaire: req.params.id,
        correctQuestions,
        incorrectQuestions,
        points: finalPoints,
        date: new Date(),
      });

      await answer.save();

      const populatedDoc = await answer.populate([
        { path: "correctQuestions" },
        { path: "incorrectQuestions" },
      ]);

      const response = {
        data: populatedDoc,
        msg: "",
        title: "",
      };

      if (finalPoints < 15) {
        response.title =
          "¡No te desanimes!. Puedes volver a intentarlo en 15 días";
        response.msg = `Tu puntaje fue ${finalPoints}, no es suficiente para pasar.`;
      } else {
        response.title = "¡Felicidades ! Has pasado la prueba.";
        response.msg = `Tu puntaje fue ${finalPoints}, lo suficiente para pasar.`;
      }

      return res.send(response);
    } catch (error) {
      next(error);
    }
  },
};
