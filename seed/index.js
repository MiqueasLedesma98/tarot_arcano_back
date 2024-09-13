require("dotenv").config();
require("colors");

const { conn } = require("../config");

const {
  User,
  Tag,
  Service,
  Review,
  Questionnaire,
  Question,
} = require("../models");

const tags = require("./tags.json");
const users = require("./users.json");
const services = require("./services.json");
const reviews = require("./reviews.json");
const questionnaire = require("./questionnaire.json");

async function seedAll() {
  try {
    if (process.env.enviroment === "prod") return;

    await conn();

    await Promise.all([
      Review.deleteMany({}),
      Service.deleteMany({}),
      Tag.deleteMany({}),
      User.deleteMany({}),
      Questionnaire.deleteMany({}),
      Question.deleteMany({}),
    ]);

    const new_reviews = [];
    const new_services = [];
    const new_tags = [];
    const new_users = [];
    const new_questionaires = [];
    const new_questions = [];

    tags.forEach((tag) => new_tags.push(new Tag(tag)));

    users.forEach((user) => new_users.push(new User(user)));

    services.forEach((service) => {
      const current = {
        ...service,
        user: new_users[service.user]._id,
        tags: service.tags.map((tag) => new_tags[tag]._id),
      };

      new_services.push(new Service(current));
    });

    questionnaire.forEach(({ questions, ...questionnaire }) => {
      const new_questionnaire = new Questionnaire(questionnaire);
      new_questionnaire.questions = []; // Initialize the questions array

      questions.forEach((question) => {
        const new_question = new Question(question);
        new_questionnaire.questions.push(new_question._id);
        new_questions.push(new_question);
      });

      new_questionaires.push(new_questionnaire);
    });

    reviews.forEach((review) => {
      const current = {
        ...review,
        service: new_services[review.service]._id,
        user: new_users[review.user]._id,
      };
      new_reviews.push(new Review(current));
    });

    await Promise.all(new_tags.map((tag) => tag.save()));
    console.log(`Se crearon ${new_tags.length} Tags`.bgGreen);

    await Promise.all(new_users.map((user) => user.save()));
    console.log(`Se crearon ${new_users.length} Usuarios`.bgGreen);

    await Promise.all(new_services.map((service) => service.save()));
    console.log(`Se crearon ${new_services.length} Servicios`.bgGreen);

    await Promise.all(new_reviews.map((review) => review.save()));
    console.log(`Se crearon ${new_reviews.length} Reseñas`.bgGreen);

    await Promise.all(
      new_questionaires.map((questionnaire) => questionnaire.save())
    );
    console.log(`Se crearon ${new_questionaires.length} Cuestionarios`.bgGreen);

    await Promise.all(new_questions.map((question) => question.save()));
    console.log(`Se crearon ${new_questions.length} Preguntas`.bgGreen);

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seedAll();
